/**
 * Starter scene — a self-contained tour of the basics.
 *
 * This file ships with the repo so a fresh clone shows something the moment you
 * run `npm run examples:dev`. Your own scenes go in a `projects/` directory at
 * the repo root (git-ignored); as soon as that directory has a `.tsx` file, the
 * dev server switches to it and this example steps aside. See the README.
 *
 * What it demonstrates:
 *   - makeScene2D + a view fill
 *   - createRef / createSignal
 *   - reactive props (a Line whose points are a function of a signal)
 *   - sequencing with yield*, all(), and easing
 */

import {Circle, Layout, Line, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  all,
  createRef,
  createSignal,
  easeInOutCubic,
  easeOutCubic,
  linear,
  waitFor,
} from '@motion-canvas/core';

// ---- Palette (see README) ----
const BG = '#0f1117';
const ACCENT = '#38bdf8'; // 200°
const SUCCESS = '#27b990'; // 160°
const GOLD = '#e8ad18'; // 45°
const TEXT = '#e2e8f0';
const DIM = '#8b97ad';
const RAIL = '#2a3346';

// Plot geometry.
const PW = 1600; // plot width
const HALF = PW / 2;
const AMP = 200; // wave amplitude
const CYCLES = 2.5; // visible cycles across the plot

// A sine wave sampled across the plot. `phase` shifts it horizontally so the
// wave appears to scroll; `amp` scales its height.
function wavePoints(phase: number, amp: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let x = -HALF; x <= HALF; x += 6) {
    const t = (x / PW) * CYCLES * 2 * Math.PI;
    pts.push([x, -amp * Math.sin(t + phase)]);
  }
  return pts;
}

export default makeScene2D(function* (view) {
  view.fill(BG);

  // Signals drive the animation. Anything that reads a signal re-renders when
  // the signal changes, so we animate the signal and let the scene follow.
  const phase = createSignal(0);
  const amp = createSignal(0);

  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const wave = createRef<Line>();
  const dot = createRef<Circle>();

  view.add(
    <Layout>
      <Txt
        ref={title}
        text="Motion Canvas — Starter Scene"
        fill={TEXT}
        fontSize={56}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight={600}
        y={-380}
        opacity={0}
      />
      <Txt
        ref={subtitle}
        text="Edit projects.example/starter.tsx — or drop your own .tsx into projects/"
        fill={DIM}
        fontSize={28}
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        y={410}
        opacity={0}
      />

      {/* Baseline. */}
      <Line
        points={[
          [-HALF, 0],
          [HALF, 0],
        ]}
        stroke={RAIL}
        lineWidth={2}
        lineDash={[6, 10]}
      />

      {/* The wave: its points are a function of the signals, so it redraws
          automatically as `phase` and `amp` animate. */}
      <Line
        ref={wave}
        points={() => wavePoints(phase(), amp())}
        stroke={ACCENT}
        lineWidth={5}
        shadowColor={ACCENT}
        shadowBlur={16}
      />

      {/* A dot that rides the crest at the plot's centre (x = 0). */}
      <Circle
        ref={dot}
        size={26}
        fill={GOLD}
        shadowColor={GOLD}
        shadowBlur={20}
        x={0}
        y={() => -amp() * Math.sin(phase())}
      />
    </Layout>,
  );

  // ---- Reveal ----
  yield* title().opacity(1, 0.6, easeOutCubic);
  yield* all(
    amp(AMP, 0.9, easeInOutCubic), // wave grows from a flat line
    subtitle().opacity(1, 0.9, easeOutCubic),
  );

  // ---- Scroll the wave a few cycles (seamless: 2π per loop) ----
  for (let i = 0; i < 4; i++) {
    yield* phase(phase() + 2 * Math.PI, 1.4, linear);
  }

  // ---- Settle: recolor to SUCCESS and flatten out ----
  yield* all(
    wave().stroke(SUCCESS, 0.6),
    wave().shadowColor(SUCCESS, 0.6),
    amp(0, 0.8, easeInOutCubic),
  );
  yield* waitFor(0.4);
});
