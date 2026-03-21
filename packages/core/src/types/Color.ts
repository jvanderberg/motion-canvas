import chroma from 'chroma-js';
import type {Color as BaseColor} from 'chroma-js';
import {type Signal, SignalContext, type SignalValue} from '../signals';
import type {InterpolationFunction} from '../tweening';
import type {Type, WebGLConvertible} from './Type';

type ColorSpace = chroma.InterpolationMode;

export type SerializedColor = string;

export type PossibleColor =
  | SerializedColor
  | number
  | BaseColor
  | {r: number; g: number; b: number; a: number};

/**
 * Extended Color type that includes the extra methods added by
 * Motion Canvas at runtime (serialize, lerp, toSymbol, toUniform).
 *
 * chroma-js v3 @types exports Color as a type alias which cannot be
 * augmented via module augmentation, so we define our own interface.
 */
export interface ColorInterface extends BaseColor, Type, WebGLConvertible {
  serialize(): string;
  lerp(
    to: ColorInterface | string | null,
    value: number,
    colorSpace?: ColorSpace,
  ): ColorInterface;
}

export type ColorSignal<T> = Signal<PossibleColor, ColorInterface, T>;

// chroma-js v3 types export Color as type-only, but it's still a class at
// runtime. Extract the constructor.
const ColorCtor: new (color: PossibleColor) => ColorInterface = (
  chroma as unknown as {Color: new (color: PossibleColor) => ColorInterface}
).Color;

interface ColorStatics {
  symbol: symbol;
  lerp(
    from: ColorInterface | string | null,
    to: ColorInterface | string | null,
    value: number,
    colorSpace?: ColorSpace,
  ): ColorInterface;
  createLerp(colorSpace: ColorSpace): InterpolationFunction<ColorInterface>;
  createSignal(
    initial?: SignalValue<PossibleColor>,
    interpolation?: InterpolationFunction<ColorInterface>,
  ): ColorSignal<void>;
}

/**
 * Represents a color.
 *
 * @remarks
 * This is the same class as the one created by
 * {@link https://gka.github.io/chroma.js/ | chroma.js}. Check out their
 * documentation for more information on how to use it.
 */
// iife prevents tree shaking from stripping our methods.
/**
 * {@inheritDoc ColorInterface}
 */
export type Color = ColorInterface;

// eslint-disable-next-line no-redeclare
export const Color: (new (
  color: PossibleColor,
) => ColorInterface) &
  ColorStatics = (() => {
  const ctor = ColorCtor as (new (
    color: PossibleColor,
  ) => ColorInterface) &
    ColorStatics;
  const proto = ColorCtor.prototype as ColorInterface;

  ctor.symbol = (proto as unknown as {symbol: symbol}).symbol = Symbol.for(
    '@motion-canvas/core/types/Color',
  );

  const staticLerp = (
    from: ColorInterface | string | null,
    to: ColorInterface | string | null,
    value: number,
    colorSpace: chroma.InterpolationMode = 'lch',
  ): ColorInterface => {
    if (typeof from === 'string') {
      from = new ColorCtor(from);
    }
    if (typeof to === 'string') {
      to = new ColorCtor(to);
    }

    const fromIsColor = from instanceof ColorCtor;
    const toIsColor = to instanceof ColorCtor;

    if (!fromIsColor) {
      from = toIsColor
        ? ((to as ColorInterface).alpha(0) as unknown as ColorInterface)
        : new ColorCtor('rgba(0, 0, 0, 0)');
    }
    if (!toIsColor) {
      to = fromIsColor
        ? ((from as ColorInterface).alpha(0) as unknown as ColorInterface)
        : new ColorCtor('rgba(0, 0, 0, 0)');
    }

    return chroma.mix(
      from as BaseColor,
      to as BaseColor,
      value,
      colorSpace,
    ) as unknown as ColorInterface;
  };

  ctor.lerp = staticLerp;
  proto.lerp = staticLerp as unknown as ColorInterface['lerp'];

  ctor.createLerp = (proto as unknown as ColorStatics).createLerp =
    (colorSpace: chroma.InterpolationMode) =>
    (
      from: ColorInterface | string | null,
      to: ColorInterface | string | null,
      value: number,
    ) =>
      staticLerp(from, to, value, colorSpace);

  ctor.createSignal = (
    initial?: SignalValue<PossibleColor>,
    interpolation: InterpolationFunction<ColorInterface> = ctor.lerp,
  ): ColorSignal<void> => {
    return new SignalContext(
      initial,
      interpolation,
      undefined,
      value => new ColorCtor(value),
    ).toSignal();
  };

  proto.toSymbol = () => {
    return ctor.symbol;
  };

  proto.toUniform = function (
    this: ColorInterface,
    gl: WebGL2RenderingContext,
    location: WebGLUniformLocation,
  ): void {
    gl.uniform4fv(location, this.gl());
  };

  proto.serialize = function (this: ColorInterface): SerializedColor {
    return this.css();
  };

  proto.lerp = function (
    this: ColorInterface,
    to: ColorInterface | string | null,
    value: number,
    colorSpace?: ColorSpace,
  ) {
    return staticLerp(this, to, value, colorSpace);
  };

  return ctor;
})();
