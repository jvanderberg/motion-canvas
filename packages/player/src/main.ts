import type {PlayerSettings, StageSettings} from '@motion-canvas/core';
import {type Player, Stage} from '@motion-canvas/core';
import styles from './styles.scss?inline';
import html from './template.html?raw';

const TEMPLATE = `<style>${styles}</style>${html}`;
const ID = 'motion-canvas-player';

enum State {
  Initial = 'initial',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

class MotionCanvasPlayer extends HTMLElement {
  public static get observedAttributes() {
    return ['src', 'quality', 'width', 'height', 'auto', 'variables'];
  }

  private get auto() {
    const attr = this.getAttribute('auto');
    return !!attr;
  }

  private get hover() {
    return this.getAttribute('auto') === 'hover';
  }

  private get width() {
    const attr = this.getAttribute('width');
    return attr ? parseFloat(attr) : this.defaultSettings.size.width;
  }

  private get height() {
    const attr = this.getAttribute('height');
    return attr ? parseFloat(attr) : this.defaultSettings.size.height;
  }

  private readonly root: ShadowRoot;
  private readonly canvas: HTMLCanvasElement;
  private readonly overlay: HTMLCanvasElement;
  private readonly button: HTMLDivElement;

  private state = State.Initial;
  private player: Player | null = null;
  private defaultSettings: PlayerSettings & StageSettings;
  private mouseMoveId: number | null = null;
  private playing = false;
  private connected = false;
  private stage = new Stage();

  public constructor() {
    super();
    this.root = this.attachShadow({mode: 'open'});
    this.root.innerHTML = TEMPLATE;

    this.overlay = this.root.querySelector('.overlay');
    this.button = this.root.querySelector('.button');
    this.canvas = this.stage.finalBuffer;
    this.canvas.classList.add('canvas');
    this.root.prepend(this.canvas);

    this.overlay.addEventListener('click', this.handleClick);
    this.overlay.addEventListener('mousemove', this.handleMouseMove);
    this.overlay.addEventListener('mouseleave', this.handleMouseLeave);
    this.button.addEventListener('mousedown', this.handleMouseDown);

    this.setState(State.Initial);
  }

  private handleMouseMove = () => {
    if (this.mouseMoveId) {
      clearTimeout(this.mouseMoveId);
    }
    if (this.hover && !this.playing) {
      this.setPlaying(true);
    }

    this.mouseMoveId = window.setTimeout(() => {
      this.mouseMoveId = null;
      this.updateClass();
    }, 2000);
    this.updateClass();
  };

  private handleMouseLeave = () => {
    if (this.hover) {
      this.setPlaying(false);
    }
    if (this.mouseMoveId) {
      clearTimeout(this.mouseMoveId);
      this.mouseMoveId = null;
      this.updateClass();
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
  };

  private handleClick = () => {
    if (this.auto) return;
    this.handleMouseMove();
    this.setPlaying(!this.playing);
    this.button.animate(
      [
        {scale: `0.9`},
        {
          scale: `1`,
          easing: 'ease-out',
        },
      ],
      {duration: 200},
    );
  };

  private setState(state: State) {
    this.state = state;
    this.setPlaying(this.playing);
  }

  private setPlaying(value: boolean) {
    if (this.state === State.Ready && (value || (this.auto && !this.hover))) {
      this.player?.togglePlayback(true);
      this.playing = true;
    } else {
      this.player?.togglePlayback(false);
      this.playing = false;
    }
    this.updateClass();
  }

  private updateClass() {
    this.overlay.className = `overlay state-${this.state}`;
    this.canvas.className = `canvas state-${this.state}`;
    this.overlay.classList.toggle('playing', this.playing);
    this.overlay.classList.toggle('auto', this.auto);
    this.overlay.classList.toggle('hover', this.mouseMoveId !== null);

    if (this.connected) {
      if (this.mouseMoveId !== null || !this.playing) {
        this.dataset.overlay = '';
      } else {
        delete this.dataset.overlay;
      }
    }
  }

  private render = async () => {
    if (this.player) {
      await this.stage.render(
        this.player.playback.currentScene,
        this.player.playback.previousScene,
      );
    }
  };
}

if (!customElements.get(ID)) {
  customElements.define(ID, MotionCanvasPlayer);
}
