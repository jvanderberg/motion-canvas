import type {
  EventHandler,
  Subscribable,
  SubscribableValueEvent,
} from '@motion-canvas/core';
import {type DependencyList, useEffect, useState} from 'react';

export function useSubscribable<TValue, THandler extends EventHandler<TValue>>(
  event: Subscribable<TValue, THandler>,
  handler: THandler,
  inputs: DependencyList,
) {
  useEffect(() => event?.subscribe(handler), [event, ...inputs, handler]);
}

export function useSubscribableValue<TValue>(
  value: SubscribableValueEvent<TValue>,
) {
  const [state, setState] = useState(value?.current);
  useEffect(() => value?.subscribe(setState), [value]);
  return state;
}
