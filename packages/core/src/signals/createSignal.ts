import {SignalContext, type SignalValue, type SimpleSignal} from '../signals';
import {deepLerp, type InterpolationFunction} from '../tweening';

export function createSignal<TValue, TOwner = void>(
  initial?: SignalValue<TValue>,
  interpolation: InterpolationFunction<TValue> = deepLerp,
  owner?: TOwner,
): SimpleSignal<TValue, TOwner> {
  return new SignalContext<TValue, TValue, TOwner>(
    initial,
    interpolation,
    owner,
  ).toSignal();
}
