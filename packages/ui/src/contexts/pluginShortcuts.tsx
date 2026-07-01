import {type Signal, useSignal} from '@preact/signals';
import {type ComponentChildren, createContext} from 'preact';
import {type MutableRef, useContext, useEffect, useRef} from 'preact/hooks';
import {MouseButton} from '../utils';
import {useApplication} from './application';

/**
 * Interactive keyboard-shortcut system used by editor plugins (e.g. the 2D
 * editor's scene-graph navigation).
 *
 * This is a self-contained port of the upstream Motion Canvas shortcuts system.
 * It is intentionally separate from the fork's simplified help-panel shortcuts
 * (`./shortcuts`), and only manages shortcuts contributed by editor plugins via
 * {@link EditorPlugin.shortcuts}.
 */

export interface Action {
  name: string;
  update: (event: PointerEvent) => void;
  finish: (value: boolean) => void;
}

export interface Shortcut {
  key: string;
  modifiers: {
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
  };
  display: string | false;
  description: string;
}

export type ShortcutConfig<T extends string> = {
  context: string;
  shortcuts: ShortcutMap<T>;
};

export type ShortcutMap<T extends string> = {
  [Key in T]?: Shortcut;
};

export type ShortcutCallback = () => Promise<Action | void> | Action | void;

export type ShortcutCallbacks<T extends string> = {
  [Key in T]?: ShortcutCallback;
};

export function makeShortcuts<T extends string>(
  context: string,
  shortcuts: ShortcutMap<T>,
): ShortcutConfig<T> {
  return {context, shortcuts};
}

interface ModifierState {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
}

type ConfigMap = Map<string, ShortcutMap<string>>;
type CallbackMap = Map<string, Set<(key: string) => Promise<Action | boolean>>>;

interface ShortcutsContextValue {
  action: Signal<Action | null>;
  global: Signal<string | null>;
  surface: Signal<string | null>;
  modifiers: Signal<ModifierState>;
  configs: MutableRef<ConfigMap>;
  callbacks: MutableRef<CallbackMap>;
}

const PluginShortcutsContext = createContext<ShortcutsContextValue>(null);

export function PluginShortcutsProvider({
  children,
}: {
  children: ComponentChildren;
}) {
  const {plugins} = useApplication();
  const global = useSignal<string | null>(null);
  const surface = useSignal<string | null>(null);
  const action = useSignal<Action | null>(null);
  const modifiers = useSignal<ModifierState>({
    shift: false,
    ctrl: false,
    alt: false,
  });
  const callbacks = useRef<CallbackMap>(new Map());
  const configMap: ConfigMap = new Map();
  for (const config of plugins.flatMap(plugin => plugin.shortcuts ?? [])) {
    const shortcutMap = configMap.get(config.context) ?? {};
    for (const [key, shortcut] of Object.entries(config.shortcuts)) {
      if (key in shortcutMap) {
        console.warn(
          `Duplicate shortcut "${key}" in context "${config.context}"`,
        );
      }
      shortcutMap[key] = shortcut as Shortcut;
    }
    configMap.set(config.context, shortcutMap);
  }
  const configsRef = useRef(configMap);
  configsRef.current = configMap;

  const updateModifiers = (event: MouseEvent | KeyboardEvent) => {
    modifiers.value = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey,
    };
  };

  async function evaluate(event: KeyboardEvent, context: string) {
    const config = configsRef.current.get(context)!;
    const callbackSet = callbacks.current.get(context);

    if (!config || !callbackSet || callbackSet.size === 0) return false;
    for (const [key, shortcut] of Object.entries(config)) {
      if (
        event.key === shortcut.key &&
        !!shortcut.modifiers.shift === event.shiftKey &&
        !!shortcut.modifiers.ctrl === event.ctrlKey &&
        !!shortcut.modifiers.alt === event.altKey
      ) {
        event.preventDefault();
        event.stopPropagation();

        for (const callback of callbackSet) {
          const result = await callback(key);
          if (typeof result === 'object') {
            action.value = result;
          }
          if (result) {
            break;
          }
        }

        return true;
      }
    }
    return false;
  }

  const evaluateAll = async (event: KeyboardEvent) => {
    updateModifiers(event);

    if (action.value) {
      if (event.key === 'Escape') {
        action.value.finish(false);
        action.value = null;
      } else if (event.key === 'Enter') {
        action.value.finish(true);
        action.value = null;
      }
      return;
    }

    if (document.activeElement?.tagName === 'INPUT') {
      return;
    }
    if (surface.value && (await evaluate(event, surface.value))) {
      return;
    }
    if (global.value && (await evaluate(event, global.value))) {
      return;
    }
  };

  useEffect(() => {
    let keyDownLock = false;
    const keyDown = (event: KeyboardEvent) => {
      if (keyDownLock) {
        return;
      }
      keyDownLock = true;
      evaluateAll(event).finally(() => {
        keyDownLock = false;
      });
    };

    const pointerMove = (event: PointerEvent) => {
      updateModifiers(event);
      if (action.value) {
        document.body.setPointerCapture(event.pointerId);
        action.value.update(event);
      }
    };

    const pointerUp = (event: PointerEvent) => {
      const isPrimary = event.button === MouseButton.Left;
      const isSecondary = event.button === MouseButton.Right;
      if (action.value && (isPrimary || isSecondary)) {
        document.body.releasePointerCapture(event.pointerId);
        action.value.finish(isPrimary);
        action.value = null;
      }
    };

    window.addEventListener('keydown', keyDown, true);
    window.addEventListener('pointermove', pointerMove, true);
    window.addEventListener('pointerup', pointerUp, true);
    window.addEventListener('keyup', updateModifiers, true);
    return () => {
      window.removeEventListener('keydown', keyDown, true);
      window.removeEventListener('pointermove', pointerMove, true);
      window.removeEventListener('pointerup', pointerUp, true);
      window.removeEventListener('keyup', updateModifiers, true);
    };
  }, []);

  return (
    <PluginShortcutsContext.Provider
      value={{
        action,
        modifiers,
        callbacks,
        surface,
        global,
        configs: configsRef,
      }}
    >
      {children}
    </PluginShortcutsContext.Provider>
  );
}

export function useShortcutContext() {
  return useContext(PluginShortcutsContext);
}

export function useModifiers() {
  return useShortcutContext().modifiers;
}

export function useSurfaceShortcuts<T extends HTMLElement>(
  config: ShortcutConfig<string>,
) {
  const {surface} = useShortcutContext();
  const ref = useRef<T>(null);

  useEffect(() => {
    const onEnter = () => {
      surface.value = config.context;
    };
    const onLeave = () => {
      if (surface.value === config.context) {
        surface.value = null;
      }
    };
    ref.current?.addEventListener('pointerenter', onEnter);
    ref.current?.addEventListener('pointermove', onEnter);
    ref.current?.addEventListener('pointerleave', onLeave);
    return () => {
      ref.current?.removeEventListener('pointerenter', onEnter);
      ref.current?.removeEventListener('pointermove', onEnter);
      ref.current?.removeEventListener('pointerleave', onLeave);
      if (surface.value === config.context) {
        surface.value = null;
      }
    };
  }, [config]);

  return ref;
}

export function useShortcut<T extends string>(
  config: ShortcutConfig<T>,
  name: T,
  handler: ShortcutCallback,
) {
  return useShortcuts<T>(config, {[name]: handler} as ShortcutCallbacks<T>);
}

export function useShortcuts<T extends string>(
  config: ShortcutConfig<T>,
  handlers: ShortcutCallbacks<T>,
) {
  const {callbacks} = useShortcutContext();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let callbackSet = callbacks.current.get(config.context);
    if (!callbackSet) {
      callbackSet = new Set();
      callbacks.current.set(config.context, callbackSet);
    }

    const handler = async (key: T) => {
      const callback = handlersRef.current[key];
      if (callback) {
        const result = await callback();
        if (typeof result === 'object') {
          return result;
        }
        return true;
      }
      return false;
    };

    callbackSet.add(handler);
    return () => {
      callbackSet.delete(handler);
    };
  }, [config]);
}
