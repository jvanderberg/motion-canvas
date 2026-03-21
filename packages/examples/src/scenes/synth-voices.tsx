import {makeScene2D, Rect, Txt, Line, Node} from '@motion-canvas/2d';
import {
  createRef,
  all,
  waitFor,
  easeOutCubic,
  easeOutBack,
  easeInOutCubic,
  createRefArray,
  type Reference,
} from '@motion-canvas/core';

// Palette: evenly-spaced hues, normalized saturation (~75-90%) and lightness (~55-60%)
const BG = '#0c1018';
const TEXT_COLOR = '#e2e8f0';
const DIM_TEXT = '#94a3b8';

const VOICE_COLOR = '#38bdf8'; // 200°  sky blue — voices/tracks
const OSC_COLOR = '#b07ce8'; // 270°  purple — oscillator
const ENV_COLOR = '#27b990'; // 160°  teal — envelope
const FILTER_COLOR = '#e870a8'; // 330°  pink — filter
const DRIVE_COLOR = '#f07830'; //  25°  orange — drive
const MIX_COLOR = '#e8ad18'; //  45°  gold — mix
const MASTER_COLOR = '#5898e8'; // 220°  blue — master

const TITLE_SIZE = 72;
const _HEADING_SIZE = 52;
const BODY_SIZE = 40;
const LABEL_SIZE = 34;
const SMALL_SIZE = 30;

export default makeScene2D(function* (view) {
  view.fill(BG);

  const root = createRef<Node>();
  view.add(<Node ref={root} />);

  // ═══════════════════════════════════════
  //  SECTION 1: Title + Voice boxes + Tracker
  // ═══════════════════════════════════════

  const HAT_COLOR = '#f07830';
  const LEAD_COLOR = '#b07ce8';
  const DRONE_COLOR = '#27b990';
  const BASS_COLOR = '#38bdf8';
  const SFX1_COLOR = '#e870a8';
  const SFX2_COLOR = '#e04e4e';
  const chanNames = ['HAT', 'LEAD', 'DRONE', 'BASS', 'LASER', 'BOOM'];
  const chanColors = [
    HAT_COLOR,
    LEAD_COLOR,
    DRONE_COLOR,
    BASS_COLOR,
    SFX1_COLOR,
    SFX2_COLOR,
  ];

  // Subtitle first — SID-inspired, centered on screen
  const subtitle = createRef<Txt>();
  root().add(
    <Txt
      ref={subtitle}
      text="SID-inspired chip-synth — same engine on web & RP2040"
      fontSize={LABEL_SIZE}
      fontFamily="monospace"
      fill={DIM_TEXT}
      y={0}
      opacity={0}
    />,
  );

  yield* subtitle().opacity(1, 0.6);
  yield* waitFor(2);

  // Title drops in above subtitle, pushes subtitle down
  const title = createRef<Txt>();
  root().add(
    <Txt
      ref={title}
      text="6-Voice Synthesizer"
      fontSize={TITLE_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={VOICE_COLOR}
      y={-460}
      opacity={0}
    />,
  );

  yield* all(title().opacity(1, 0.8), subtitle().y(-380, 0.8, easeOutCubic));
  yield* waitFor(0.8);

  // Flexible assignment text
  const flexText = createRef<Txt>();
  root().add(
    <Txt
      ref={flexText}
      text="Any voice can play music or fire an effect — dynamically assigned"
      fontSize={SMALL_SIZE}
      fontFamily="monospace"
      fill={DIM_TEXT}
      y={-320}
      opacity={0}
    />,
  );

  yield* flexText().opacity(1, 0.5);
  yield* waitFor(1.5);

  // Voice boxes — "Voice 0" through "Voice 5", uniform blue
  const voiceBoxes = createRefArray<Rect>();
  const voiceW = 150;
  const voiceH = 70;
  const voiceGap = 14;
  const totalW = 6 * voiceW + 5 * voiceGap;
  const voiceStartX = -totalW / 2 + voiceW / 2;
  const voiceY = -200;

  for (let i = 0; i < 6; i++) {
    root().add(
      <Rect
        ref={voiceBoxes}
        x={voiceStartX + i * (voiceW + voiceGap)}
        y={voiceY}
        width={voiceW}
        height={voiceH}
        radius={12}
        fill={'#0b1118'}
        stroke={VOICE_COLOR}
        lineWidth={2}
        opacity={0}
        scale={0.8}
      >
        <Txt
          text={`Voice ${i}`}
          fontSize={26}
          fontFamily="monospace"
          fontWeight={700}
          fill={VOICE_COLOR}
        />
      </Rect>,
    );
  }

  // Stagger voice box entrances
  for (let i = 0; i < 6; i++) {
    yield* all(
      voiceBoxes[i].opacity(1, 0.3),
      voiceBoxes[i].scale(1, 0.3, easeOutBack),
    );
  }
  yield* waitFor(0.5);

  // Channel name labels — second row below voice boxes
  const chanLabelRefs = createRefArray<Txt>();
  const chanLabelY = voiceY + voiceH / 2 + 24;
  for (let i = 0; i < 6; i++) {
    root().add(
      <Txt
        ref={chanLabelRefs}
        text={chanNames[i]}
        fontSize={22}
        fontFamily="monospace"
        fontWeight={700}
        fill={chanColors[i]}
        x={voiceStartX + i * (voiceW + voiceGap)}
        y={chanLabelY}
        opacity={0}
      />,
    );
  }
  yield* all(...chanLabelRefs.map(l => l.opacity(1, 0.4)));
  yield* waitFor(0.5);

  // Tracker data
  const hat = [
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
    'C-5',
    '···',
  ];
  const lead = [
    'C-4',
    '···',
    '···',
    'E-4',
    '···',
    '···',
    'G-4',
    '···',
    '···',
    'C-5',
    '···',
    'B-4',
    '···',
    '···',
    'G-4',
    '···',
    'E-4',
    '···',
    '···',
    'C-4',
    '···',
    '···',
    'D-4',
    '···',
    '···',
    'F-4',
    '···',
    '···',
    'A-4',
    '···',
    'G-4',
    '···',
  ];
  const drone = [
    'G-2',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    'G-2',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
    '———',
  ];
  const bass = [
    'C-2',
    '···',
    '···',
    '···',
    'C-2',
    '···',
    'G-1',
    '···',
    'C-2',
    '···',
    '···',
    '···',
    'E-1',
    '···',
    'G-1',
    '···',
    'C-2',
    '···',
    '···',
    '···',
    'C-2',
    '···',
    'G-1',
    '···',
    'A-1',
    '···',
    '···',
    '···',
    'G-1',
    '···',
    'C-2',
    '···',
  ];
  const sfx1 = [
    '···',
    '···',
    '···',
    'LAS',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    'LAS',
    '···',
    '···',
    '···',
    '···',
    '···',
    'LAS',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    'LAS',
    '···',
    '···',
  ];
  const sfx2 = [
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    'EXP',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    'EXP',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    '···',
    'EXP',
    '···',
    '···',
    '···',
    '···',
  ];
  const trackerRows = hat.map((_, i) => [
    hat[i],
    lead[i],
    drone[i],
    bass[i],
    sfx1[i],
    sfx2[i],
  ]);

  // Tracker grid — below channel labels with breathing room
  const colW = voiceW + voiceGap;
  const rowH = 36;
  const trackerTop = chanLabelY + 30; // below channel name labels
  const visibleH = 440; // clip height

  const trackerClip = createRef<Rect>();
  const trackerScroll = createRef<Node>();
  root().add(
    <Rect
      ref={trackerClip}
      x={0}
      y={trackerTop + visibleH / 2}
      width={totalW + 20}
      height={visibleH}
      clip
      opacity={0}
    >
      <Node ref={trackerScroll} />
    </Rect>,
  );

  // Separator lines between columns
  const sepLines = createRefArray<Line>();
  for (let c = 1; c < 6; c++) {
    root().add(
      <Line
        ref={sepLines}
        points={[
          [voiceStartX - voiceW / 2 + c * colW - voiceGap / 2, trackerTop],
          [
            voiceStartX - voiceW / 2 + c * colW - voiceGap / 2,
            trackerTop + visibleH,
          ],
        ]}
        stroke={'#141c28'}
        lineWidth={1}
        opacity={0}
      />,
    );
  }

  // Playback cursor bar — sits at the top of the tracker (just under voices)
  const cursorBarY = trackerTop + rowH / 2;
  const cursorBar = createRef<Rect>();
  root().add(
    <Rect
      ref={cursorBar}
      y={cursorBarY}
      width={totalW + 20}
      height={rowH + 4}
      radius={4}
      fill={'#38bdf818'}
      stroke={'#38bdf850'}
      lineWidth={1}
      opacity={0}
    />,
  );

  // Create tracker rows inside scroll container
  // Row 0 starts at the bottom of the visible area and scrolls up
  const cellRefs: Txt[][] = [];
  const scrollStartY = rowH * 2; // start near the top, close to voices

  for (let r = 0; r < trackerRows.length; r++) {
    const rowCells: Txt[] = [];
    for (let c = 0; c < 6; c++) {
      const cell = createRef<Txt>();
      const val = trackerRows[r][c];
      const isNote = val !== '···' && val !== '———';
      trackerScroll().add(
        <Txt
          ref={cell}
          text={val}
          fontSize={24}
          fontFamily="monospace"
          fontWeight={isNote ? 700 : 400}
          fill={isNote ? chanColors[c] : '#283848'}
          x={voiceStartX + c * colW}
          y={scrollStartY + r * rowH}
        />,
      );
      rowCells.push(cell());
    }
    cellRefs.push(rowCells);
  }

  // Show tracker elements
  yield* all(
    trackerClip().opacity(1, 0.5),
    cursorBar().opacity(1, 0.5),
    ...sepLines.map(s => s.opacity(1, 0.5)),
  );

  // Scroll rows upward — each row passes through the cursor bar
  // When a note crosses the cursor, flash the corresponding voice box
  const scrollCount = 24;
  const scrollDuration = 6;
  const rowDur = scrollDuration / scrollCount;

  for (let step = 0; step < scrollCount; step++) {
    // Scroll so this row aligns with the cursor
    const targetY = -(step + 1) * rowH;
    yield* trackerScroll().position.y(targetY, rowDur * 0.85, easeOutCubic);

    // Flash voice boxes for active notes in this row
    const r = step;
    if (r < trackerRows.length) {
      const _flashPromises: any[] = [];
      for (let c = 0; c < 6; c++) {
        const val = trackerRows[r][c];
        const isNote = val !== '···' && val !== '———';
        if (isNote) {
          // Flash the voice box
          voiceBoxes[c].lineWidth(4);
          voiceBoxes[c].fill('#121e2c');
          // Flash the cell white
          const _orig = String(cellRefs[r][c].fill());
          cellRefs[r][c].fill('#ffffff');
        }
      }
      yield* waitFor(rowDur * 0.12);
      // Reset flashes
      for (let c = 0; c < 6; c++) {
        const val = trackerRows[r][c];
        const isNote = val !== '···' && val !== '———';
        if (isNote) {
          voiceBoxes[c].lineWidth(2);
          voiceBoxes[c].fill('#0b1118');
          cellRefs[r][c].fill(chanColors[c]);
        }
      }
    }
  }

  yield* waitFor(1);

  // Fade out tracker, channel labels, subtitle, and flex text
  yield* all(
    trackerClip().opacity(0, 0.6),
    cursorBar().opacity(0, 0.5),
    ...sepLines.map(s => s.opacity(0, 0.5)),
    ...chanLabelRefs.map(l => l.opacity(0, 0.5)),
    subtitle().opacity(0, 0.5),
    flexText().opacity(0, 0.5),
  );
  yield* waitFor(0.5);

  // ═══════════════════════════════════════
  //  SECTION 3: Zoom into one voice — signal chain
  // ═══════════════════════════════════════

  yield* all(
    title().text('Inside a Voice', 0),
    title().fill(OSC_COLOR, 0.5),
    subtitle().opacity(0, 0.4),
  );

  // Dim voices 1–5, expand voice 0
  for (let i = 1; i < 6; i++) {
    yield voiceBoxes[i].opacity(0, 0.6);
  }

  yield* all(
    voiceBoxes[0].x(0, 0.8, easeInOutCubic),
    voiceBoxes[0].y(-280, 0.8, easeInOutCubic),
    voiceBoxes[0].width(260, 0.8, easeInOutCubic),
    voiceBoxes[0].height(60, 0.8, easeInOutCubic),
    voiceBoxes[0].stroke('#c084fc80', 0.6),
  );
  yield* waitFor(0.5);

  // Signal chain blocks
  const _chainY = -280;
  const blockW = 220;
  const blockH = 80;
  const chainGap = 40;
  const chainNodes: Reference<Rect>[] = [];
  const chainLabels = ['Oscillator', 'Envelope', 'Filter', 'Drive'];
  const chainColors = [OSC_COLOR, ENV_COLOR, FILTER_COLOR, DRIVE_COLOR];
  const chainBgs = ['#140c20', '#0b1612', '#1a0c14', '#161008'];

  // Position chain centered below the voice 0 label
  const chainStartX = (-(chainLabels.length - 1) * (blockW + chainGap)) / 2;
  const chainBlockY = -170;

  for (let i = 0; i < chainLabels.length; i++) {
    const ref = createRef<Rect>();
    chainNodes.push(ref);
    root().add(
      <Rect
        ref={ref}
        x={chainStartX + i * (blockW + chainGap)}
        y={chainBlockY}
        width={blockW}
        height={blockH}
        radius={14}
        fill={chainBgs[i]}
        stroke={chainColors[i]}
        lineWidth={2.5}
        opacity={0}
        scale={0.8}
      >
        <Txt
          text={chainLabels[i]}
          fontSize={LABEL_SIZE}
          fontFamily="monospace"
          fontWeight={700}
          fill={chainColors[i]}
        />
      </Rect>,
    );
  }

  // Arrows between chain blocks
  const arrows = createRefArray<Line>();
  for (let i = 0; i < chainLabels.length - 1; i++) {
    const x1 = chainStartX + i * (blockW + chainGap) + blockW / 2;
    const x2 = chainStartX + (i + 1) * (blockW + chainGap) - blockW / 2;
    root().add(
      <Line
        ref={arrows}
        points={[
          [x1 + 4, chainBlockY],
          [x2 - 4, chainBlockY],
        ]}
        stroke={DIM_TEXT}
        lineWidth={3}
        endArrow
        arrowSize={14}
        opacity={0}
      />,
    );
  }

  // Reveal chain blocks with arrows
  for (let i = 0; i < chainLabels.length; i++) {
    yield* all(
      chainNodes[i]().opacity(1, 0.5),
      chainNodes[i]().scale(1, 0.5, easeOutBack),
    );
    if (i < arrows.length) {
      yield* arrows[i].opacity(1, 0.3);
    }
  }
  yield* waitFor(1.5);

  // Helper: highlight active chain block, dim others
  function* highlightChain(activeIdx: number) {
    yield* all(
      ...chainNodes.map((n, i) =>
        i === activeIdx
          ? all(
              n().lineWidth(5, 0.4),
              n().scale(1.08, 0.4, easeOutCubic),
              n().opacity(1, 0.4),
            )
          : all(
              n().lineWidth(2.5, 0.4),
              n().scale(1, 0.4),
              n().opacity(0.35, 0.4),
            ),
      ),
    );
  }
  function* _unhighlightChain() {
    yield* all(
      ...chainNodes.map(n =>
        all(n().lineWidth(2.5, 0.3), n().scale(1, 0.3), n().opacity(1, 0.3)),
      ),
    );
  }

  // ─── Oscillator detail ───
  yield* highlightChain(0);

  const oscDetail = createRef<Txt>();
  const oscWaves = createRef<Txt>();
  root().add(
    <>
      <Txt
        ref={oscDetail}
        text="4 waveforms to choose from"
        fontSize={BODY_SIZE}
        fontFamily="monospace"
        fill={TEXT_COLOR}
        y={-60}
        opacity={0}
      />
      <Txt
        ref={oscWaves}
        text="Pulse  ·  Sawtooth  ·  Triangle  ·  Noise"
        fontSize={LABEL_SIZE}
        fontFamily="monospace"
        fontWeight={700}
        fill={OSC_COLOR}
        y={0}
        opacity={0}
      />
    </>,
  );

  yield* oscDetail().opacity(1, 0.6);
  yield* oscWaves().opacity(1, 0.6);
  yield* waitFor(1);

  const pulseNote = createRef<Txt>();
  root().add(
    <Txt
      ref={pulseNote}
      text="Pulse has variable duty cycle (0–255)"
      fontSize={SMALL_SIZE}
      fontFamily="monospace"
      fill={DIM_TEXT}
      y={50}
      opacity={0}
    />,
  );
  yield* pulseNote().opacity(1, 0.5);
  yield* waitFor(2);

  // ─── Envelope detail ───
  yield* all(
    oscDetail().opacity(0, 0.3),
    oscWaves().opacity(0, 0.3),
    pulseNote().opacity(0, 0.3),
  );
  yield* highlightChain(1);

  const envTitle = createRef<Txt>();
  root().add(
    <Txt
      ref={envTitle}
      text="ADSR Envelope"
      fontSize={BODY_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={ENV_COLOR}
      y={-60}
      opacity={0}
    />,
  );
  yield* envTitle().opacity(1, 0.5);

  // ADSR visual — simple labeled shape using lines
  const adsrY = 100;
  const adsrW = 750;
  const adsrH = 140;
  const adsrLeft = -adsrW / 2;

  // Points: start → attack peak → decay to sustain → sustain hold → release to zero
  const aPct = 0.18;
  const dPct = 0.22;
  const sPct = 0.35;
  const sLevel = 0.6;

  const adsrLine = createRef<Line>();
  root().add(
    <Line
      ref={adsrLine}
      points={[
        [adsrLeft, adsrY + adsrH / 2],
        [adsrLeft + adsrW * aPct, adsrY - adsrH / 2],
        [adsrLeft + adsrW * (aPct + dPct), adsrY + adsrH / 2 - adsrH * sLevel],
        [
          adsrLeft + adsrW * (aPct + dPct + sPct),
          adsrY + adsrH / 2 - adsrH * sLevel,
        ],
        [adsrLeft + adsrW, adsrY + adsrH / 2],
      ]}
      stroke={ENV_COLOR}
      lineWidth={3}
      opacity={0}
    />,
  );

  // ADSR labels — full names
  const adsrLabels = createRefArray<Txt>();
  const stageNames = ['Attack', 'Decay', 'Sustain', 'Release'];
  const stageDescs = ['ramp up', 'fall to hold', 'hold level', 'fade out'];
  const stageXs = [
    adsrLeft + (adsrW * aPct) / 2,
    adsrLeft + adsrW * (aPct + dPct / 2),
    adsrLeft + adsrW * (aPct + dPct + sPct / 2),
    adsrLeft + adsrW * (aPct + dPct + sPct + (1 - aPct - dPct - sPct) / 2),
  ];

  const adsrDescs = createRefArray<Txt>();
  for (let i = 0; i < 4; i++) {
    root().add(
      <>
        <Txt
          ref={adsrLabels}
          text={stageNames[i]}
          fontSize={SMALL_SIZE}
          fontFamily="monospace"
          fontWeight={700}
          fill={ENV_COLOR}
          x={stageXs[i]}
          y={adsrY + adsrH / 2 + 30}
          opacity={0}
        />
        <Txt
          ref={adsrDescs}
          text={stageDescs[i]}
          fontSize={22}
          fontFamily="monospace"
          fill={DIM_TEXT}
          x={stageXs[i]}
          y={adsrY + adsrH / 2 + 58}
          opacity={0}
        />
      </>,
    );
  }

  yield* adsrLine().opacity(1, 0.8);
  // Reveal each stage one at a time
  for (let i = 0; i < 4; i++) {
    yield* all(adsrLabels[i].opacity(1, 0.4), adsrDescs[i].opacity(1, 0.4));
    yield* waitFor(0.6);
  }

  const adsrNote = createRef<Txt>();
  root().add(
    <Txt
      ref={adsrNote}
      text="Each stage 0–255 — shapes every note's volume over time"
      fontSize={SMALL_SIZE}
      fontFamily="monospace"
      fill={DIM_TEXT}
      y={adsrY + adsrH / 2 + 100}
      opacity={0}
    />,
  );
  yield* adsrNote().opacity(1, 0.5);
  yield* waitFor(2.5);

  // ─── Filter detail ───
  yield* all(
    envTitle().opacity(0, 0.3),
    adsrLine().opacity(0, 0.3),
    adsrNote().opacity(0, 0.3),
    ...adsrLabels.map(l => l.opacity(0, 0.3)),
    ...adsrDescs.map(d => d.opacity(0, 0.3)),
  );
  yield* highlightChain(2);

  const filterTitle = createRef<Txt>();
  const filterModes = createRef<Txt>();
  const filterNote = createRef<Txt>();
  root().add(
    <>
      <Txt
        ref={filterTitle}
        text="5 Filter Modes"
        fontSize={BODY_SIZE}
        fontFamily="monospace"
        fontWeight={700}
        fill={FILTER_COLOR}
        y={-60}
        opacity={0}
      />
      <Txt
        ref={filterModes}
        text="Low-pass  ·  Band-pass  ·  High-pass  ·  Notch  ·  Comb"
        fontSize={LABEL_SIZE}
        fontFamily="monospace"
        fill={FILTER_COLOR}
        y={0}
        opacity={0}
      />
      <Txt
        ref={filterNote}
        text="Cutoff + Resonance — per-voice AND master"
        fontSize={SMALL_SIZE}
        fontFamily="monospace"
        fill={DIM_TEXT}
        y={50}
        opacity={0}
      />
    </>,
  );

  yield* filterTitle().opacity(1, 0.5);
  yield* filterModes().opacity(1, 0.5);
  yield* filterNote().opacity(1, 0.5);
  yield* waitFor(3);

  // ─── Drive detail ───
  yield* all(
    filterTitle().opacity(0, 0.3),
    filterModes().opacity(0, 0.3),
    filterNote().opacity(0, 0.3),
  );
  yield* highlightChain(3);

  const driveTitle = createRef<Txt>();
  const driveDesc = createRef<Txt>();
  root().add(
    <>
      <Txt
        ref={driveTitle}
        text="Per-Voice Drive"
        fontSize={BODY_SIZE}
        fontFamily="monospace"
        fontWeight={700}
        fill={DRIVE_COLOR}
        y={-60}
        opacity={0}
      />
      <Txt
        ref={driveDesc}
        text="Soft saturation waveshaper — 0 (clean) to 255 (gritty)"
        fontSize={LABEL_SIZE}
        fontFamily="monospace"
        fill={DIM_TEXT}
        y={0}
        opacity={0}
      />
    </>,
  );

  yield* driveTitle().opacity(1, 0.5);
  yield* driveDesc().opacity(1, 0.5);
  yield* waitFor(2.5);

  // ═══════════════════════════════════════
  //  SECTION 4: Full signal flow
  // ═══════════════════════════════════════

  // Clear section 3
  yield* all(
    driveTitle().opacity(0, 0.3),
    driveDesc().opacity(0, 0.3),
    ...chainNodes.map(n => n().opacity(0, 0.3)),
    ...arrows.map(a => a.opacity(0, 0.3)),
    voiceBoxes[0].opacity(0, 0.3),
    ...[1, 2, 3, 4, 5].map(i => voiceBoxes[i].opacity(0, 0.3)),
  );

  yield* all(title().text('Signal Flow', 0), title().fill(MIX_COLOR, 0.5));
  yield* waitFor(0.5);

  // 6 voice lanes converging into a mixer
  const laneY = -240;
  const laneH = 160;
  const laneW = 130;
  const laneGapX = 18;
  const totalLaneW = 6 * laneW + 5 * laneGapX;
  const laneStartX = -totalLaneW / 2 + laneW / 2;

  const lanes = createRefArray<Rect>();
  const _laneLabels = createRefArray<Txt>();

  for (let i = 0; i < 6; i++) {
    const lx = laneStartX + i * (laneW + laneGapX);
    root().add(
      <Rect
        ref={lanes}
        x={lx}
        y={laneY}
        width={laneW}
        height={laneH}
        radius={10}
        fill={'#0b1118'}
        stroke={VOICE_COLOR}
        lineWidth={2}
        opacity={0}
        scale={0.8}
      >
        <Txt
          text={`V${i}`}
          fontSize={SMALL_SIZE}
          fontFamily="monospace"
          fontWeight={700}
          fill={VOICE_COLOR}
          y={-50}
        />
        <Txt
          text="Osc"
          fontSize={22}
          fontFamily="monospace"
          fill={OSC_COLOR}
          y={-16}
        />
        <Txt
          text="ADSR"
          fontSize={22}
          fontFamily="monospace"
          fill={ENV_COLOR}
          y={10}
        />
        <Txt
          text="Filt"
          fontSize={22}
          fontFamily="monospace"
          fill={FILTER_COLOR}
          y={36}
        />
        <Txt
          text="Drive"
          fontSize={22}
          fontFamily="monospace"
          fill={DRIVE_COLOR}
          y={62}
        />
      </Rect>,
    );
  }

  // Pop in lanes
  for (let i = 0; i < 6; i++) {
    yield* all(lanes[i].opacity(1, 0.3), lanes[i].scale(1, 0.3, easeOutBack));
  }
  yield* waitFor(1);

  // Merge arrows from each lane into mixer
  const mixerY = -10;
  const mixerBox = createRef<Rect>();
  root().add(
    <Rect
      ref={mixerBox}
      y={mixerY}
      width={340}
      height={70}
      radius={14}
      fill={'#161208'}
      stroke={MIX_COLOR}
      lineWidth={3}
      opacity={0}
      scale={0.8}
    >
      <Txt
        text="Mixer (sum ÷ 6)"
        fontSize={LABEL_SIZE}
        fontFamily="monospace"
        fontWeight={700}
        fill={MIX_COLOR}
      />
    </Rect>,
  );

  // Converge lines
  const convergeLines = createRefArray<Line>();
  for (let i = 0; i < 6; i++) {
    const lx = laneStartX + i * (laneW + laneGapX);
    root().add(
      <Line
        ref={convergeLines}
        points={[
          [lx, laneY + laneH / 2 + 4],
          [0, mixerY - 35 - 4],
        ]}
        stroke={DIM_TEXT}
        lineWidth={1.5}
        endArrow
        arrowSize={8}
        opacity={0}
      />,
    );
  }

  yield* all(
    ...convergeLines.map(l => l.opacity(0.6, 0.5)),
    mixerBox().opacity(1, 0.6),
    mixerBox().scale(1, 0.6, easeOutBack),
  );
  yield* waitFor(1);

  // Master filter
  const masterFilterBox = createRef<Rect>();
  const masterFilterArrow = createRef<Line>();
  root().add(
    <>
      <Line
        ref={masterFilterArrow}
        points={[
          [0, mixerY + 35 + 4],
          [0, mixerY + 90],
        ]}
        stroke={DIM_TEXT}
        lineWidth={2}
        endArrow
        arrowSize={10}
        opacity={0}
      />
      <Rect
        ref={masterFilterBox}
        y={mixerY + 130}
        width={340}
        height={70}
        radius={14}
        fill={'#1a0c14'}
        stroke={FILTER_COLOR}
        lineWidth={3}
        opacity={0}
        scale={0.8}
      >
        <Txt
          text="Master Filter"
          fontSize={LABEL_SIZE}
          fontFamily="monospace"
          fontWeight={700}
          fill={FILTER_COLOR}
        />
      </Rect>
    </>,
  );

  yield* all(
    masterFilterArrow().opacity(1, 0.4),
    masterFilterBox().opacity(1, 0.5),
    masterFilterBox().scale(1, 0.5, easeOutBack),
  );
  yield* waitFor(0.5);

  // Master volume → output
  const masterVolBox = createRef<Rect>();
  const masterVolArrow = createRef<Line>();
  const outputArrow = createRef<Line>();
  const outputLabel = createRef<Txt>();
  root().add(
    <>
      <Line
        ref={masterVolArrow}
        points={[
          [0, mixerY + 165 + 4],
          [0, mixerY + 210],
        ]}
        stroke={DIM_TEXT}
        lineWidth={2}
        endArrow
        arrowSize={10}
        opacity={0}
      />
      <Rect
        ref={masterVolBox}
        y={mixerY + 250}
        width={340}
        height={70}
        radius={14}
        fill={'#0b1118'}
        stroke={MASTER_COLOR}
        lineWidth={3}
        opacity={0}
        scale={0.8}
      >
        <Txt
          text="Master Volume"
          fontSize={LABEL_SIZE}
          fontFamily="monospace"
          fontWeight={700}
          fill={MASTER_COLOR}
        />
      </Rect>
      <Line
        ref={outputArrow}
        points={[
          [0, mixerY + 285 + 4],
          [0, mixerY + 330],
        ]}
        stroke={DIM_TEXT}
        lineWidth={2}
        endArrow
        arrowSize={10}
        opacity={0}
      />
      <Txt
        ref={outputLabel}
        text="I2S / AudioWorklet"
        fontSize={SMALL_SIZE}
        fontFamily="monospace"
        fontWeight={700}
        fill={TEXT_COLOR}
        y={mixerY + 360}
        opacity={0}
      />
    </>,
  );

  yield* all(
    masterVolArrow().opacity(1, 0.4),
    masterVolBox().opacity(1, 0.5),
    masterVolBox().scale(1, 0.5, easeOutBack),
  );
  yield* all(outputArrow().opacity(1, 0.4), outputLabel().opacity(1, 0.5));
  yield* waitFor(3);

  // ═══════════════════════════════════════
  //  SECTION 5: BASIC API
  // ═══════════════════════════════════════

  // Fade out signal flow
  yield* all(
    ...lanes.map(l => l.opacity(0, 0.4)),
    ...convergeLines.map(l => l.opacity(0, 0.3)),
    mixerBox().opacity(0, 0.4),
    masterFilterBox().opacity(0, 0.4),
    masterVolBox().opacity(0, 0.4),
    masterFilterArrow().opacity(0, 0.3),
    masterVolArrow().opacity(0, 0.3),
    outputArrow().opacity(0, 0.3),
    outputLabel().opacity(0, 0.3),
  );

  yield* all(
    title().text('Controlled from BASIC', 0),
    title().fill(ENV_COLOR, 0.5),
  );
  yield* waitFor(0.5);

  // Code examples — code on left, annotations indented below
  const codeEntries: {code: string; note: string; color: string}[] = [
    {
      code: 'VOICE 0, WAVE_PULSE, 440, 128',
      note: 'voice 0: pulse wave, 440 Hz, 50% duty',
      color: OSC_COLOR,
    },
    {
      code: 'ENVELOPE 0, 10, 80, 180, 120',
      note: 'fast attack, medium decay, high sustain',
      color: ENV_COLOR,
    },
    {
      code: 'VFILTER 0, 200, 100, FILTER_LP',
      note: 'low-pass filter, cutoff 200, resonance 100',
      color: FILTER_COLOR,
    },
    {code: 'VDRIVE 0, 60', note: 'mild overdrive', color: DRIVE_COLOR},
  ];

  const codeRefs = createRefArray<Txt>();
  const annotRefs = createRefArray<Txt>();
  const codeStartY = -280;
  const codePairH = 70; // code line + annotation pair height
  const codeX = -340;

  for (let i = 0; i < codeEntries.length; i++) {
    const pairY = codeStartY + i * codePairH;
    root().add(
      <>
        <Txt
          ref={codeRefs}
          text={codeEntries[i].code}
          fontSize={LABEL_SIZE}
          fontFamily="monospace"
          fontWeight={700}
          fill={codeEntries[i].color}
          x={codeX}
          y={pairY}
          opacity={0}
          textAlign="left"
          offset={[-1, 0]}
        />
        <Txt
          ref={annotRefs}
          text={codeEntries[i].note}
          fontSize={24}
          fontFamily="monospace"
          fill={DIM_TEXT}
          x={codeX + 20}
          y={pairY + 34}
          opacity={0}
          textAlign="left"
          offset={[-1, 0]}
        />
      </>,
    );
  }

  // Reveal code lines with annotations
  for (let i = 0; i < 4; i++) {
    yield* all(codeRefs[i].opacity(1, 0.4), annotRefs[i].opacity(1, 0.4));
    yield* waitFor(0.8);
  }

  yield* waitFor(1);

  // SFX and TONE
  const sfxLine = createRef<Txt>();
  const toneLine = createRef<Txt>();
  const sfxStartY = codeStartY + codePairH * 4 + 20;
  root().add(
    <>
      <Txt
        ref={sfxLine}
        text="SFX SFX_LASER, 3"
        fontSize={LABEL_SIZE}
        fontFamily="monospace"
        fontWeight={700}
        fill={MIX_COLOR}
        x={codeX}
        y={sfxStartY}
        opacity={0}
        textAlign="left"
        offset={[-1, 0]}
      />
      <Txt
        ref={toneLine}
        text="TONE 1, 880, 200"
        fontSize={LABEL_SIZE}
        fontFamily="monospace"
        fontWeight={700}
        fill={VOICE_COLOR}
        x={codeX}
        y={sfxStartY + 50}
        opacity={0}
        textAlign="left"
        offset={[-1, 0]}
      />
    </>,
  );

  yield* all(sfxLine().opacity(1, 0.4), toneLine().opacity(1, 0.4));
  yield* waitFor(1);

  const sfxNote = createRef<Txt>();
  root().add(
    <Txt
      ref={sfxNote}
      text="16 built-in SFX presets + custom effects"
      fontSize={SMALL_SIZE}
      fontFamily="monospace"
      fill={DIM_TEXT}
      x={codeX + 20}
      y={sfxStartY + 100}
      opacity={0}
      textAlign="left"
      offset={[-1, 0]}
    />,
  );
  yield* sfxNote().opacity(1, 0.5);
  yield* waitFor(3);

  // ═══════════════════════════════════════
  //  SECTION 6: Songs & sequencer
  // ═══════════════════════════════════════

  yield* all(
    ...codeRefs.map(c => c.opacity(0, 0.3)),
    ...annotRefs.map(a => a.opacity(0, 0.3)),
    sfxLine().opacity(0, 0.3),
    toneLine().opacity(0, 0.3),
    sfxNote().opacity(0, 0.3),
  );

  yield* all(
    title().text('Built-in Sequencer', 0),
    title().fill(MIX_COLOR, 0.5),
  );
  yield* waitFor(0.5);

  const songCode: {text: string; color: string}[] = [
    {text: 'EFFECT lead', color: OSC_COLOR},
    {text: '  STEP 0,  WAVE_PULSE, 0, 92, 255, 0', color: DIM_TEXT},
    {text: '  STEP 70, WAVE_PULSE, 0, 92, 176, 0', color: DIM_TEXT},
    {text: '  STEP 170, OFF', color: DIM_TEXT},
    {text: 'END EFFECT', color: OSC_COLOR},
    {text: '', color: DIM_TEXT},
    {text: 'EFFECT bass', color: FILTER_COLOR},
    {text: '  STEP 0,  WAVE_SAW, 0, 64, 255, 0', color: DIM_TEXT},
    {text: '  STEP 100, OFF', color: DIM_TEXT},
    {text: 'END EFFECT', color: FILTER_COLOR},
    {text: '', color: DIM_TEXT},
    {text: 'SONG spacey, 120, 1', color: MIX_COLOR},
    {text: '  TRACK 0, lead, 0, 0, "C4:4 E4:4 G4:8"', color: VOICE_COLOR},
    {text: '  TRACK 1, bass, 0, 0, "C2:8 G2:4 C2:4"', color: VOICE_COLOR},
    {text: 'END SONG', color: MIX_COLOR},
    {text: '', color: DIM_TEXT},
    {text: 'MPLAY spacey', color: ENV_COLOR},
  ];

  const songRefs = createRefArray<Txt>();
  const songStartY = -320;
  const songLineH = 38;

  for (let i = 0; i < songCode.length; i++) {
    root().add(
      <Txt
        ref={songRefs}
        text={songCode[i].text}
        fontSize={SMALL_SIZE}
        fontFamily="monospace"
        fontWeight={songCode[i].color !== DIM_TEXT ? 700 : 400}
        fill={songCode[i].color}
        x={codeX}
        y={songStartY + i * songLineH}
        opacity={0}
        textAlign="left"
        offset={[-1, 0]}
      />,
    );
  }

  // Lead EFFECT block (indices 0-4)
  for (let i = 0; i < 5; i++) {
    yield* songRefs[i].opacity(1, 0.3);
  }
  yield* waitFor(0.8);

  // Bass EFFECT block (indices 6-10)
  for (let i = 6; i < 11; i++) {
    yield* songRefs[i].opacity(1, 0.3);
  }
  yield* waitFor(0.8);

  const effectNote = createRef<Txt>();
  root().add(
    <Txt
      ref={effectNote}
      text="Custom instruments: step-based automation over time"
      fontSize={24}
      fontFamily="monospace"
      fill={DIM_TEXT}
      x={codeX + 20}
      y={songStartY + songLineH * 10 - 10}
      opacity={0}
      textAlign="left"
      offset={[-1, 0]}
    />,
  );
  yield* effectNote().opacity(1, 0.4);
  yield* waitFor(1.5);
  yield* effectNote().opacity(0, 0.3);

  // SONG block (indices 11-14)
  for (let i = 11; i < 15; i++) {
    yield* songRefs[i].opacity(1, 0.3);
  }
  yield* waitFor(1);

  // MPLAY (index 16)
  yield* songRefs[16].opacity(1, 0.4);
  yield* waitFor(1);

  const seqNote = createRef<Txt>();
  root().add(
    <Txt
      ref={seqNote}
      text="Music + SFX share voices — smart pre-emption keeps them in sync"
      fontSize={24}
      fontFamily="monospace"
      fill={DIM_TEXT}
      x={codeX + 20}
      y={songStartY + songLineH * 17 + 10}
      opacity={0}
      textAlign="left"
      offset={[-1, 0]}
    />,
  );
  yield* seqNote().opacity(1, 0.5);
  yield* waitFor(3);

  // ═══════════════════════════════════════
  //  SECTION 7: Closing
  // ═══════════════════════════════════════

  yield* all(
    ...songRefs.map(s => s.opacity(0, 0.4)),
    seqNote().opacity(0, 0.3),
  );

  yield* all(
    title().text('6 Voices — Endless Possibilities', 0),
    title().fill(VOICE_COLOR, 0.5),
  );

  const closingItems = [
    '4 waveforms · ADSR envelopes · 5 filter types',
    'Per-voice drive · Master filter & volume',
    '16 built-in SFX · Custom effects · Song sequencer',
    'Identical behavior: browser & RP2040',
  ];

  const closingRefs = createRefArray<Txt>();
  const closingY = -240;
  const closingGap = 70;

  for (let i = 0; i < closingItems.length; i++) {
    root().add(
      <Txt
        ref={closingRefs}
        text={closingItems[i]}
        fontSize={LABEL_SIZE}
        fontFamily="monospace"
        fill={TEXT_COLOR}
        y={closingY + i * closingGap}
        opacity={0}
      />,
    );
  }

  for (let i = 0; i < closingItems.length; i++) {
    yield* closingRefs[i].opacity(1, 0.5);
    yield* waitFor(0.8);
  }
  yield* waitFor(3);

  yield* root().opacity(0, 1.5);
});
