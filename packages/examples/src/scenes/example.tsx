import {makeScene2D, Rect, Txt, Node} from '@motion-canvas/2d';
import {
  createRef,
  all,
  waitFor,
  easeOutCubic,
  easeOutBack,
} from '@motion-canvas/core';

const BG = '#0f1117';
const TEXT_COLOR = '#e2e8f0';
const DIM_TEXT = '#94a3b8';

const CORE_COLOR = '#34d399';
const SYSCALL_COLOR = '#f472b6';
const BYTECODE_COLOR = '#60a5fa';
const COMPILER_COLOR = '#c084fc';
const BASIC_COLOR = '#e6a700';
const BROWSER_COLOR = '#fb923c';
const RP2040_COLOR = '#38bdf8';

// Font sizes — nothing below 30
const TITLE_SIZE = 90;
const SHELL_LABEL = 48;
const SHELL_DESC = 34;
const PLAT_LABEL = 40;
const PLAT_DESC = 30;
const CALLOUT_SIZE = 44;

export default makeScene2D(function* (view) {
  view.fill(BG);

  const root = createRef<Node>();
  view.add(<Node ref={root} />);

  // ─── Title ───
  const title = createRef<Txt>();
  root().add(
    <Txt
      ref={title}
      text="Pico Gamer VM"
      fontSize={TITLE_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={TEXT_COLOR}
      y={-480}
      opacity={0}
    />,
  );

  yield* title().opacity(1, 0.8);
  yield* waitFor(1);

  // ─── Layout ───
  // Each shell's text band needs: ~48 label + ~34 desc + padding = ~110px
  const band = 130;

  // Platform boxes
  const platW = 360,
    platH = 160;

  // Inner content: two platform boxes side by side
  const innerW = platW * 2 + 80;
  const innerH = platH;

  // Build shell sizes inside-out
  const coreW = innerW + 140,
    coreH = innerH + band + 20;
  const syscallW = coreW + 140,
    syscallH = coreH + band;
  const bytecodeW = syscallW + 140,
    bytecodeH = syscallH + band;
  const compilerW = bytecodeW + 140,
    compilerH = bytecodeH + band;
  const basicW = compilerW + 160,
    basicH = compilerH + band;

  // Position everything to fill the screen vertically
  // Title is at -480, so shells start below that
  // Bottom of screen is ~+540, leave room for callout text
  const shellTop = -390;

  const basicY = shellTop + basicH / 2;
  const compilerY = shellTop + band + compilerH / 2;
  const bytecodeY = shellTop + band * 2 + bytecodeH / 2;
  const syscallY = shellTop + band * 3 + syscallH / 2;
  const coreY = shellTop + band * 4 + coreH / 2;
  const platY = coreY + coreH / 2 - platH / 2 - 10;

  // ─── Platform boxes ───
  const browserBox = createRef<Rect>();
  const rp2040Box = createRef<Rect>();

  root().add(
    <>
      <Rect
        ref={browserBox}
        x={-200}
        y={platY}
        width={platW}
        height={platH}
        radius={16}
        fill={'#1e1408'}
        stroke={BROWSER_COLOR}
        lineWidth={3}
        opacity={0}
        scale={0.8}
      >
        <Txt
          text="Browser API"
          fontSize={PLAT_LABEL}
          fontFamily="monospace"
          fontWeight={700}
          fill={BROWSER_COLOR}
          y={-34}
        />
        <Txt
          text={'WASM · Canvas\nWeb Audio'}
          fontSize={PLAT_DESC}
          fontFamily="monospace"
          fill={DIM_TEXT}
          y={24}
          textAlign="center"
        />
      </Rect>
      <Rect
        ref={rp2040Box}
        x={200}
        y={platY}
        width={platW}
        height={platH}
        radius={16}
        fill={'#081820'}
        stroke={RP2040_COLOR}
        lineWidth={3}
        opacity={0}
        scale={0.8}
      >
        <Txt
          text="RP2040"
          fontSize={PLAT_LABEL}
          fontFamily="monospace"
          fontWeight={700}
          fill={RP2040_COLOR}
          y={-34}
        />
        <Txt
          text={'Native · OLED\nGPIO'}
          fontSize={PLAT_DESC}
          fontFamily="monospace"
          fill={DIM_TEXT}
          y={24}
          textAlign="center"
        />
      </Rect>
    </>,
  );

  // ─── VM Core ───
  const coreShell = createRef<Rect>();
  root().add(
    <Rect
      ref={coreShell}
      y={coreY}
      width={coreW}
      height={coreH}
      radius={18}
      fill={null}
      stroke={CORE_COLOR}
      lineWidth={3}
      opacity={0}
      scale={0.8}
    >
      <Txt
        text="VM Core"
        fontSize={SHELL_LABEL}
        fontFamily="monospace"
        fontWeight={700}
        fill={CORE_COLOR}
        y={-coreH / 2 + 30}
      />
      <Txt
        text="64KB RAM · 256-entry Stack · 16-bit PC"
        fontSize={SHELL_DESC}
        fontFamily="monospace"
        fill={DIM_TEXT}
        y={-coreH / 2 + 82}
      />
    </Rect>,
  );

  // ─── Syscalls ───
  const syscallShell = createRef<Rect>();
  root().add(
    <Rect
      ref={syscallShell}
      y={syscallY}
      width={syscallW}
      height={syscallH}
      radius={22}
      fill={null}
      stroke={SYSCALL_COLOR}
      lineWidth={3}
      opacity={0}
      scale={0.8}
    >
      <Txt
        text="Syscalls"
        fontSize={SHELL_LABEL}
        fontFamily="monospace"
        fontWeight={700}
        fill={SYSCALL_COLOR}
        y={-syscallH / 2 + 30}
      />
      <Txt
        text="Display · Sprites · Input · Audio · Tiles"
        fontSize={SHELL_DESC}
        fontFamily="monospace"
        fill={DIM_TEXT}
        y={-syscallH / 2 + 82}
      />
    </Rect>,
  );

  // ─── Bytecode ───
  const bytecodeShell = createRef<Rect>();
  root().add(
    <Rect
      ref={bytecodeShell}
      y={bytecodeY}
      width={bytecodeW}
      height={bytecodeH}
      radius={26}
      fill={null}
      stroke={BYTECODE_COLOR}
      lineWidth={3}
      opacity={0}
      scale={0.8}
    >
      <Txt
        text="Bytecode"
        fontSize={SHELL_LABEL}
        fontFamily="monospace"
        fontWeight={700}
        fill={BYTECODE_COLOR}
        y={-bytecodeH / 2 + 30}
      />
      <Txt
        text="PUSH · ADD · JMP · CALL · LOAD · SYSCALL"
        fontSize={SHELL_DESC}
        fontFamily="monospace"
        fill={DIM_TEXT}
        y={-bytecodeH / 2 + 82}
      />
    </Rect>,
  );

  // ─── Compiler ───
  const compilerShell = createRef<Rect>();
  root().add(
    <Rect
      ref={compilerShell}
      y={compilerY}
      width={compilerW}
      height={compilerH}
      radius={30}
      fill={null}
      stroke={COMPILER_COLOR}
      lineWidth={3}
      opacity={0}
      scale={0.8}
    >
      <Txt
        text="Compiler"
        fontSize={SHELL_LABEL}
        fontFamily="monospace"
        fontWeight={700}
        fill={COMPILER_COLOR}
        y={-compilerH / 2 + 30}
      />
      <Txt
        text="Lexer → Parser → Codegen → Assembler"
        fontSize={SHELL_DESC}
        fontFamily="monospace"
        fill={DIM_TEXT}
        y={-compilerH / 2 + 82}
      />
    </Rect>,
  );

  // ─── BASIC ───
  const basicShell = createRef<Rect>();
  root().add(
    <Rect
      ref={basicShell}
      y={basicY}
      width={basicW}
      height={basicH}
      radius={34}
      fill={null}
      stroke={BASIC_COLOR}
      lineWidth={4}
      opacity={0}
      scale={0.8}
    >
      <Txt
        text="BASIC"
        fontSize={SHELL_LABEL}
        fontFamily="monospace"
        fontWeight={700}
        fill={BASIC_COLOR}
        y={-basicH / 2 + 30}
      />
      <Txt
        text="SPRITE · DRAW · IF/THEN · GOSUB · SOUND"
        fontSize={SHELL_DESC}
        fontFamily="monospace"
        fill={DIM_TEXT}
        y={-basicH / 2 + 82}
      />
    </Rect>,
  );

  // ─── Animate inside-out ───

  // Platform boxes slide in from the sides
  browserBox().x(-500);
  rp2040Box().x(500);
  yield* all(
    browserBox().opacity(1, 0.8),
    browserBox().x(-200, 1, easeOutBack),
    browserBox().scale(1, 1, easeOutCubic),
    rp2040Box().opacity(1, 0.8),
    rp2040Box().x(200, 1, easeOutBack),
    rp2040Box().scale(1, 1, easeOutCubic),
  );
  yield* waitFor(2);

  // Shells pop in with bounce overshoot
  yield* all(
    coreShell().opacity(1, 0.8),
    coreShell().scale(1, 0.8, easeOutBack),
  );
  yield* waitFor(1.5);

  yield* all(
    syscallShell().opacity(1, 0.8),
    syscallShell().scale(1, 0.8, easeOutBack),
  );
  yield* waitFor(1.5);

  yield* all(
    bytecodeShell().opacity(1, 0.8),
    bytecodeShell().scale(1, 0.8, easeOutBack),
  );
  yield* waitFor(1.5);

  yield* all(
    compilerShell().opacity(1, 0.8),
    compilerShell().scale(1, 0.8, easeOutBack),
  );
  yield* waitFor(1.5);

  yield* all(
    basicShell().opacity(1, 0.8),
    basicShell().scale(1, 0.8, easeOutBack),
  );
  yield* waitFor(2.5);

  // ─── Highlight shared core ───
  const sharedLabel = createRef<Txt>();
  root().add(
    <Txt
      ref={sharedLabel}
      text="Same C++ VM — two backends"
      fontSize={CALLOUT_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={CORE_COLOR}
      y={basicY + basicH / 2 + 60}
      opacity={0}
    />,
  );

  yield* all(
    coreShell().lineWidth(6, 0.8),
    browserBox().lineWidth(5, 0.8),
    rp2040Box().lineWidth(5, 0.8),
    sharedLabel().opacity(1, 1),
  );
  yield* waitFor(3);

  yield* all(
    coreShell().lineWidth(3, 0.8),
    browserBox().lineWidth(3, 0.8),
    rp2040Box().lineWidth(3, 0.8),
    sharedLabel().opacity(0, 0.8),
  );
  yield* waitFor(0.5);

  // ─── Tagline ───
  const tagline = createRef<Txt>();
  root().add(
    <Txt
      ref={tagline}
      text="Write BASIC — run anywhere"
      fontSize={CALLOUT_SIZE}
      fontFamily="monospace"
      fontWeight={700}
      fill={BASIC_COLOR}
      y={basicY + basicH / 2 + 60}
      opacity={0}
    />,
  );

  yield* tagline().opacity(1, 1);
  yield* waitFor(3);
});
