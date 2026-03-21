import {makeScene2D, Rect, Txt, Node} from '@motion-canvas/2d';
import {
  createRef,
  all,
  waitFor,
  easeOutCubic,
  easeOutBack,
  easeInOutCubic,
} from '@motion-canvas/core';

// Palette: split-complementary, anchored on ACCENT (200°)
// Cool cluster: ACCENT + SUCCESS | Warm cluster: GOLD → WARN → DANGER
const BG = '#0c1018';
const TEXT_COLOR = '#e2e8f0';
const DIM_TEXT = '#94a3b8';
const ACCENT = '#38bdf8'; // 200°  anchor
const SUCCESS = '#27b990'; // 160°  analogous-cool
const GOLD = '#e8ad18'; //  45°  warm complement
const WARN = '#f07830'; //  25°  adjacent to GOLD
const DANGER = '#e04e4e'; //   0°  end of warm ramp

const TITLE_SIZE = 72;
const BODY_SIZE = 44;
const MATH_SIZE = 40;
const LABEL_SIZE = 36;

const barW = 800;
const barH = 50;
const barLeft = -barW / 2;

export default makeScene2D(function* (view) {
  view.fill(BG);

  const root = createRef<Node>();
  view.add(<Node ref={root} />);

  // ═══════════════════════════════════════
  //  SECTION 1: Can we hit 60fps? + bandwidth
  // ═══════════════════════════════════════

  const title = createRef<Txt>();
  root().add(
    <Txt
      ref={title}
      text="Can we hit 60fps on the Pico?"
      fontSize={TITLE_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={ACCENT}
      y={-420}
      opacity={0}
    />,
  );

  yield* title().opacity(1, 0.8);
  yield* waitFor(1.5);

  // Math
  const mathLine1 = createRef<Txt>();
  const mathLine2 = createRef<Txt>();
  root().add(
    <>
      <Txt
        ref={mathLine1}
        text="128 × 64 × 60 fps"
        fontSize={MATH_SIZE}
        fontFamily="monospace"
        fill={TEXT_COLOR}
        y={-280}
        opacity={0}
      />
      <Txt
        ref={mathLine2}
        text="= 491,520 bits/sec"
        fontSize={MATH_SIZE}
        fontFamily="monospace"
        fill={GOLD}
        y={-210}
        opacity={0}
      />
    </>,
  );

  yield* mathLine1().opacity(1, 0.6);
  yield* waitFor(0.8);
  yield* mathLine2().opacity(1, 0.6);
  yield* waitFor(2);

  // Bandwidth bar — positioned well below math, with generous spacing
  const bwBarY = -40;

  const bwLabel = createRef<Txt>();
  const bwBg = createRef<Rect>();
  const bwFill = createRef<Rect>();
  const bwCapLabel = createRef<Txt>();
  const bw0 = createRef<Txt>();
  const bw1M = createRef<Txt>();

  const kToWidth = (k: number) => (k / 1000) * barW;

  root().add(
    <>
      <Txt
        ref={bwLabel}
        text="I²C Clock: 400 kHz (default)"
        fontSize={LABEL_SIZE}
        fontFamily="monospace"
        fill={DIM_TEXT}
        y={bwBarY - 60}
        opacity={0}
      />
      <Rect
        ref={bwBg}
        y={bwBarY}
        width={barW}
        height={barH}
        radius={10}
        fill={'#141c28'}
        opacity={0}
      />
      <Rect
        ref={bwFill}
        x={barLeft}
        y={bwBarY}
        width={0}
        height={barH}
        radius={10}
        fill={ACCENT}
        opacity={0}
        offset={[-1, 0]}
      />
      <Txt
        ref={bwCapLabel}
        text=""
        fontSize={30}
        fontFamily="monospace"
        fontWeight={700}
        fill={TEXT_COLOR}
        y={bwBarY}
        opacity={0}
      />
      <Txt
        ref={bw0}
        text="0"
        fontSize={30}
        fontFamily="monospace"
        fill={DIM_TEXT}
        x={barLeft}
        y={bwBarY + 50}
        opacity={0}
      />
      <Txt
        ref={bw1M}
        text="1 MHz"
        fontSize={30}
        fontFamily="monospace"
        fill={DIM_TEXT}
        x={barLeft + barW}
        y={bwBarY + 50}
        opacity={0}
      />
    </>,
  );

  yield* all(
    bwLabel().opacity(1, 0.6),
    bwBg().opacity(1, 0.6),
    bw0().opacity(1, 0.6),
    bw1M().opacity(1, 0.6),
  );

  // Fill to 400k capacity
  yield* all(
    bwFill().opacity(1, 0.3),
    bwFill().width(kToWidth(400), 1, easeOutCubic),
    bwCapLabel().text('capacity: 400k', 0),
    bwCapLabel().x(barLeft + kToWidth(400) / 2, 0),
    bwCapLabel().opacity(1, 0.8),
  );
  yield* waitFor(1.5);

  // Verdict: need 491k, not enough
  const verdict = createRef<Txt>();
  root().add(
    <Txt
      ref={verdict}
      text="Need 491k — not enough!"
      fontSize={BODY_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={DANGER}
      y={bwBarY + 120}
      opacity={0}
    />,
  );

  yield* all(bwFill().fill(DANGER, 0.5), verdict().opacity(1, 0.6));
  yield* waitFor(2.5);

  // Overclock!
  yield* all(verdict().opacity(0, 0.4), bwCapLabel().opacity(0, 0.3));

  yield* all(
    bwFill().fill(SUCCESS, 0.8),
    bwFill().width(barW, 1.2, easeOutCubic),
    bwLabel().text('I²C Clock: 1 MHz (overclocked!)', 0),
  );

  const overclockOk = createRef<Txt>();
  root().add(
    <Txt
      ref={overclockOk}
      text="Plenty of bandwidth now"
      fontSize={BODY_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={SUCCESS}
      y={bwBarY + 120}
      opacity={0}
    />,
  );
  yield* overclockOk().opacity(1, 0.6);
  yield* waitFor(2.5);

  // ═══════════════════════════════════════
  //  SECTION 2: CPU budget — FULL CLEAR first
  // ═══════════════════════════════════════

  yield* all(
    mathLine1().opacity(0, 0.4),
    mathLine2().opacity(0, 0.4),
    bwLabel().opacity(0, 0.4),
    bwBg().opacity(0, 0.4),
    bwFill().opacity(0, 0.4),
    bwCapLabel().opacity(0, 0.4),
    bw0().opacity(0, 0.4),
    bw1M().opacity(0, 0.4),
    overclockOk().opacity(0, 0.4),
  );

  yield* all(
    title().text("But there's a problem...", 0),
    title().fill(WARN, 0.6),
  );
  yield* waitFor(1);

  // CPU bar — centered vertically with lots of room
  const cpuBarY = -100;

  const cpuLabel = createRef<Txt>();
  const cpuBg = createRef<Rect>();
  const cpuFill = createRef<Rect>();
  const cpuPctTxt = createRef<Txt>();
  const cpu0 = createRef<Txt>();
  const cpu100 = createRef<Txt>();

  root().add(
    <>
      <Txt
        ref={cpuLabel}
        text="CPU Budget per Frame"
        fontSize={LABEL_SIZE}
        fontFamily="monospace"
        fill={DIM_TEXT}
        y={cpuBarY - 120}
        opacity={0}
      />
      <Rect
        ref={cpuBg}
        y={cpuBarY}
        width={barW}
        height={barH}
        radius={10}
        fill={'#141c28'}
        opacity={0}
      />
      <Rect
        ref={cpuFill}
        x={barLeft}
        y={cpuBarY}
        width={0}
        height={barH}
        radius={10}
        fill={WARN}
        opacity={0}
        offset={[-1, 0]}
      />
      <Txt
        ref={cpuPctTxt}
        text=""
        fontSize={BODY_SIZE}
        fontFamily="monospace"
        fontWeight={700}
        fill={WARN}
        y={cpuBarY - 60}
        opacity={0}
      />
      <Txt
        ref={cpu0}
        text="0%"
        fontSize={30}
        fontFamily="monospace"
        fill={DIM_TEXT}
        x={barLeft}
        y={cpuBarY + 50}
        opacity={0}
      />
      <Txt
        ref={cpu100}
        text="100%"
        fontSize={30}
        fontFamily="monospace"
        fill={DIM_TEXT}
        x={barLeft + barW}
        y={cpuBarY + 50}
        opacity={0}
      />
    </>,
  );

  yield* all(
    cpuLabel().opacity(1, 0.6),
    cpuBg().opacity(1, 0.6),
    cpu0().opacity(1, 0.6),
    cpu100().opacity(1, 0.6),
  );

  // Fill to 55%
  yield* all(
    cpuFill().opacity(1, 0.3),
    cpuFill().width(barW * 0.5, 1.5, easeOutCubic),
  );

  yield* all(
    cpuPctTxt().text('Display I²C: 50%', 0),
    cpuPctTxt().x(barLeft + (barW * 0.5) / 2, 0),
    cpuPctTxt().opacity(1, 0.5),
  );
  yield* waitFor(1);

  const cpuWarning = createRef<Txt>();
  root().add(
    <Txt
      ref={cpuWarning}
      text="No room left for game logic!"
      fontSize={BODY_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={DANGER}
      y={cpuBarY + 120}
      opacity={0}
    />,
  );
  yield* cpuWarning().opacity(1, 0.6);
  yield* waitFor(3);

  // ═══════════════════════════════════════
  //  SECTION 3: Compress — FULL CLEAR first
  // ═══════════════════════════════════════

  yield* cpuWarning().opacity(0, 0.4);

  yield* all(title().text('What if we compress?', 0), title().fill(GOLD, 0.5));
  yield* waitFor(1);

  // Strategy text — below the CPU bar with generous spacing
  const stratY = cpuBarY + 160;
  const stratGap = 80;

  const strat1 = createRef<Txt>();
  const strat2 = createRef<Txt>();
  const strat3 = createRef<Txt>();

  root().add(
    <>
      <Txt
        ref={strat1}
        text="Custom driver: double buffer, detect changes"
        fontSize={MATH_SIZE}
        fontFamily="monospace"
        fill={TEXT_COLOR}
        y={stratY}
        opacity={0}
      />
      <Txt
        ref={strat2}
        text="OLED pages are 8 bits tall → skip unchanged"
        fontSize={MATH_SIZE}
        fontFamily="monospace"
        fill={TEXT_COLOR}
        y={stratY + stratGap}
        opacity={0}
      />
      <Txt
        ref={strat3}
        text="Huge savings on typical frames"
        fontSize={MATH_SIZE}
        fontFamily="monospace"
        fontWeight={700}
        fill={SUCCESS}
        y={stratY + stratGap * 2}
        opacity={0}
      />
    </>,
  );

  yield* strat1().opacity(1, 0.6);
  yield* waitFor(1);

  // Fade CPU bar to make room for grid visualization
  yield* all(
    cpuBg().opacity(0, 0.4),
    cpuFill().opacity(0, 0.4),
    cpuLabel().opacity(0, 0.4),
    cpuPctTxt().opacity(0, 0.4),
    cpu0().opacity(0, 0.4),
    cpu100().opacity(0, 0.4),
    strat1().y(-300, 0.6, easeOutCubic),
  );

  // ── Pixel grid visualization: prev → curr → diff → changed only ──
  const gridN = 20;
  const cellSz = 13;
  const gStep = cellSz + 2;
  const gridPx = gridN * gStep; // 300

  // Pixel data
  const prevPx: boolean[][] = [];
  const currPx: boolean[][] = [];
  for (let r = 0; r < gridN; r++) {
    prevPx.push(Array(gridN).fill(false));
    currPx.push(Array(gridN).fill(false));
  }

  // Sprite shape (small blocky character)
  const shape = [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [0, 1, 1, 0],
    [1, 0, 0, 1],
  ];
  for (let sr = 0; sr < shape.length; sr++)
    for (let sc = 0; sc < shape[sr].length; sc++)
      if (shape[sr][sc]) {
        prevPx[8 + sr][7 + sc] = true;
        currPx[8 + sr][9 + sc] = true; // shifted right by 2
      }

  // Background dots (unchanged between frames)
  const bgDots = [
    [1, 3],
    [3, 15],
    [5, 18],
    [13, 2],
    [15, 17],
    [17, 9],
    [19, 11],
    [0, 10],
    [6, 1],
    [11, 14],
  ];
  for (const [r, c] of bgDots) {
    prevPx[r][c] = true;
    currPx[r][c] = true;
  }

  // Grid layout — all three side by side
  const gridCY = -40;
  const gridGap = 70; // space between grids for arrows
  const gxLeft = -(gridPx + gridGap);
  const gxRight = gridPx + gridGap;
  const OFF_COLOR = '#0e1219';

  const prevGridNode = createRef<Node>();
  const currGridNode = createRef<Node>();
  const diffGridNode = createRef<Node>();
  const gArrow1 = createRef<Txt>();
  const gArrow2 = createRef<Txt>();
  const gLabelPrev = createRef<Txt>();
  const gLabelCurr = createRef<Txt>();
  const gLabelDiff = createRef<Txt>();

  root().add(
    <>
      <Node ref={prevGridNode} x={gxLeft} y={gridCY} opacity={0}>
        <Rect
          width={gridPx + 8}
          height={gridPx + 8}
          radius={6}
          fill={'#0c1018'}
          stroke={'#1e2636'}
          lineWidth={1}
        />
      </Node>
      <Node ref={currGridNode} x={0} y={gridCY} opacity={0}>
        <Rect
          width={gridPx + 8}
          height={gridPx + 8}
          radius={6}
          fill={'#0c1018'}
          stroke={'#1e2636'}
          lineWidth={1}
        />
      </Node>
      <Node ref={diffGridNode} x={gxRight} y={gridCY} opacity={0}>
        <Rect
          width={gridPx + 8}
          height={gridPx + 8}
          radius={6}
          fill={'#0c1018'}
          stroke={SUCCESS}
          lineWidth={2}
        />
      </Node>
      <Txt
        ref={gArrow1}
        text="→"
        fontSize={48}
        fontFamily="monospace"
        fill={DIM_TEXT}
        x={(gxLeft + 0) / 2}
        y={gridCY}
        opacity={0}
      />
      <Txt
        ref={gArrow2}
        text="diff →"
        fontSize={28}
        fontFamily="monospace"
        fontWeight={700}
        fill={GOLD}
        x={(0 + gxRight) / 2}
        y={gridCY}
        opacity={0}
      />
      <Txt
        ref={gLabelPrev}
        text="Previous Frame"
        fontSize={24}
        fontFamily="monospace"
        fill={DIM_TEXT}
        x={gxLeft}
        y={gridCY + gridPx / 2 + 26}
        opacity={0}
      />
      <Txt
        ref={gLabelCurr}
        text="Current Frame"
        fontSize={24}
        fontFamily="monospace"
        fill={DIM_TEXT}
        x={0}
        y={gridCY + gridPx / 2 + 26}
        opacity={0}
      />
      <Txt
        ref={gLabelDiff}
        text="Send only these!"
        fontSize={24}
        fontFamily="monospace"
        fontWeight={700}
        fill={SUCCESS}
        x={gxRight}
        y={gridCY + gridPx / 2 + 26}
        opacity={0}
      />
    </>,
  );

  // Populate grid cells
  const addCells = (parent: Node, pixels: boolean[][], onColor: string) => {
    for (let r = 0; r < gridN; r++) {
      for (let c = 0; c < gridN; c++) {
        parent.add(
          <Rect
            x={c * gStep - gridPx / 2 + cellSz / 2}
            y={r * gStep - gridPx / 2 + cellSz / 2}
            width={cellSz}
            height={cellSz}
            radius={2}
            fill={pixels[r][c] ? onColor : OFF_COLOR}
          />,
        );
      }
    }
  };

  addCells(prevGridNode(), prevPx, ACCENT);
  addCells(currGridNode(), currPx, ACCENT);

  // Diff grid: red = erase (was on, now off), green = draw (was off, now on)
  for (let r = 0; r < gridN; r++) {
    for (let c = 0; c < gridN; c++) {
      const wasOn = prevPx[r][c];
      const isOn = currPx[r][c];
      let color = OFF_COLOR;
      if (wasOn && !isOn) color = DANGER;
      else if (!wasOn && isOn) color = SUCCESS;
      diffGridNode().add(
        <Rect
          x={c * gStep - gridPx / 2 + cellSz / 2}
          y={r * gStep - gridPx / 2 + cellSz / 2}
          width={cellSz}
          height={cellSz}
          radius={2}
          fill={color}
        />,
      );
    }
  }

  // Animate: previous frame appears
  yield* all(prevGridNode().opacity(1, 0.6), gLabelPrev().opacity(1, 0.6));
  yield* waitFor(0.6);

  // Current frame + arrow
  yield* all(
    gArrow1().opacity(1, 0.4),
    currGridNode().opacity(1, 0.6),
    gLabelCurr().opacity(1, 0.6),
  );
  yield* waitFor(1.2);

  // Diff grid appears — red=removed, green=added
  yield* all(
    gArrow2().opacity(1, 0.4),
    diffGridNode().opacity(1, 0.6),
    gLabelDiff().opacity(1, 0.6),
  );
  yield* waitFor(2.5);

  // Show strat3 below all grids
  strat3().y(gridCY + gridPx / 2 + 70);
  yield* strat3().opacity(1, 0.6);
  yield* waitFor(2);

  // Fade grids, restore CPU bar at 20%
  yield* all(
    prevGridNode().opacity(0, 0.4),
    currGridNode().opacity(0, 0.4),
    diffGridNode().opacity(0, 0.4),
    gArrow1().opacity(0, 0.4),
    gArrow2().opacity(0, 0.4),
    gLabelPrev().opacity(0, 0.4),
    gLabelCurr().opacity(0, 0.4),
    gLabelDiff().opacity(0, 0.4),
    strat3().opacity(0, 0.4),
    strat1().opacity(0, 0.4),
  );

  yield* all(
    cpuBg().opacity(1, 0.4),
    cpuFill().opacity(1, 0.3),
    cpuFill().width(barW * 0.2, 1, easeInOutCubic),
    cpuFill().fill(SUCCESS, 0.8),
    cpuLabel().opacity(1, 0.4),
    cpuPctTxt().text('Display: 20%', 0),
    cpuPctTxt().x(barLeft + (barW * 0.2) / 2, 0),
    cpuPctTxt().fill(SUCCESS, 0.5),
    cpuPctTxt().opacity(1, 0.4),
    cpu0().opacity(1, 0.4),
    cpu100().opacity(1, 0.4),
  );
  yield* waitFor(2);

  // Worst case
  yield* all(
    strat1().opacity(0, 0.4),
    strat2().opacity(0, 0.4),
    strat3().opacity(0, 0.4),
  );

  const worstCase = createRef<Txt>();
  root().add(
    <Txt
      ref={worstCase}
      text="But worst case (full redraw)... still ~50%"
      fontSize={BODY_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={WARN}
      y={cpuBarY + 120}
      opacity={0}
    />,
  );

  yield* all(
    worstCase().opacity(1, 0.6),
    cpuFill().width(barW * 0.5, 1.2, easeInOutCubic),
    cpuFill().fill(WARN, 0.8),
    cpuPctTxt().text('Display: 50%', 0),
    cpuPctTxt().x(barLeft + (barW * 0.5) / 2, 0),
    cpuPctTxt().fill(WARN, 0.5),
  );
  yield* waitFor(3);

  // ═══════════════════════════════════════
  //  SECTION 4: Two cores — FULL CLEAR
  // ═══════════════════════════════════════

  yield* all(
    worstCase().opacity(0, 0.4),
    cpuFill().opacity(0, 0.4),
    cpuBg().opacity(0, 0.4),
    cpuLabel().opacity(0, 0.4),
    cpuPctTxt().opacity(0, 0.4),
    cpu0().opacity(0, 0.4),
    cpu100().opacity(0, 0.4),
  );

  yield* all(
    title().text('RP2040 has two cores!', 0),
    title().fill(SUCCESS, 0.5),
  );
  yield* waitFor(1);

  // Two core boxes — vertically centered
  const coreW = 360;
  const coreH = 280;
  const coreGap = 80;
  const coreY = -40;

  const core0 = createRef<Rect>();
  const core1 = createRef<Rect>();

  root().add(
    <>
      <Rect
        ref={core0}
        x={-(coreW / 2 + coreGap / 2)}
        y={coreY}
        width={coreW}
        height={coreH}
        radius={18}
        fill={'#0b1612'}
        stroke={SUCCESS}
        lineWidth={3}
        opacity={0}
        scale={0.8}
      >
        <Txt
          text="Core 0"
          fontSize={LABEL_SIZE}
          fontFamily="monospace"
          fontWeight={700}
          fill={SUCCESS}
          y={-70}
        />
        <Txt
          text="Game Logic"
          fontSize={MATH_SIZE}
          fontFamily="monospace"
          fill={TEXT_COLOR}
          y={10}
        />
        <Txt
          text="100% available"
          fontSize={30}
          fontFamily="monospace"
          fill={SUCCESS}
          y={80}
        />
      </Rect>
      <Rect
        ref={core1}
        x={coreW / 2 + coreGap / 2}
        y={coreY}
        width={coreW}
        height={coreH}
        radius={18}
        fill={'#0b1118'}
        stroke={ACCENT}
        lineWidth={3}
        opacity={0}
        scale={0.8}
      >
        <Txt
          text="Core 1"
          fontSize={LABEL_SIZE}
          fontFamily="monospace"
          fontWeight={700}
          fill={ACCENT}
          y={-70}
        />
        <Txt
          text="Display I²C"
          fontSize={MATH_SIZE}
          fontFamily="monospace"
          fill={TEXT_COLOR}
          y={10}
        />
        <Txt
          text="Dedicated"
          fontSize={30}
          fontFamily="monospace"
          fill={DIM_TEXT}
          y={80}
        />
      </Rect>
    </>,
  );

  yield* all(core0().opacity(1, 0.8), core0().scale(1, 0.8, easeOutBack));
  yield* waitFor(0.5);
  yield* all(core1().opacity(1, 0.8), core1().scale(1, 0.8, easeOutBack));
  yield* waitFor(2.5);

  // ═══════════════════════════════════════
  //  SECTION 5: DMA
  // ═══════════════════════════════════════

  yield* all(title().text('Even better — DMA', 0), title().fill(GOLD, 0.5));
  yield* waitFor(1);

  // DMA box appears below the two cores
  const dmaBoxW = coreW * 2 + coreGap;
  const dmaBoxH = 140;
  const dmaBoxY = coreY + coreH / 2 + 30 + dmaBoxH / 2;

  const dmaBox = createRef<Rect>();
  root().add(
    <Rect
      ref={dmaBox}
      y={dmaBoxY}
      width={dmaBoxW}
      height={dmaBoxH}
      radius={18}
      fill={'#161208'}
      stroke={GOLD}
      lineWidth={3}
      opacity={0}
      scale={0.8}
    >
      <Txt
        text="DMA Controller"
        fontSize={LABEL_SIZE}
        fontFamily="monospace"
        fontWeight={700}
        fill={GOLD}
        y={-30}
      />
      <Txt
        text="I²C transfer in hardware — zero CPU"
        fontSize={30}
        fontFamily="monospace"
        fill={DIM_TEXT}
        y={30}
      />
    </Rect>,
  );

  // DMA box pops in
  yield* all(dmaBox().opacity(1, 0.8), dmaBox().scale(1, 0.8, easeOutBack));
  yield* waitFor(2);

  // Core 1 becomes free — dim it and stamp "FREE" over it
  const core1Free = createRef<Txt>();
  root().add(
    <Txt
      ref={core1Free}
      text="FREE"
      fontSize={60}
      fontFamily="monospace"
      fontWeight={700}
      fill={SUCCESS}
      x={coreW / 2 + coreGap / 2}
      y={coreY}
      opacity={0}
    />,
  );

  yield* all(
    core1().stroke(SUCCESS, 0.8),
    core1().fill('#0b1612', 0.8),
    core1().opacity(0.35, 0.8),
    core1Free().opacity(1, 0.8),
  );
  yield* waitFor(1.5);

  // Result text
  const dmaResult = createRef<Txt>();
  root().add(
    <Txt
      ref={dmaResult}
      text="Display refresh is essentially free"
      fontSize={BODY_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={SUCCESS}
      y={dmaBoxY + dmaBoxH / 2 + 70}
      opacity={0}
    />,
  );

  yield* dmaResult().opacity(1, 0.8);
  yield* waitFor(3);

  yield* root().opacity(0, 1.5);
});
