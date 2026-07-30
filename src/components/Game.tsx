import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Home, RefreshCw, Trash2 } from "lucide-react";
import type { BoardState, Difficulty, Mark, Mode, RoundResult } from "../lib/game";
import { chooseBotMove, EMPTY_BOARD, other, resultOf } from "../lib/game";
import { drawSound, loseSound, placeO, placeX, uiClick, winSound } from "../lib/sound";
import { Board } from "./Board";
import { Burst } from "./Burst";
import { MiniO, MiniX, OMark, XMark } from "./Marks";
import { BauButton, Badge } from "./ui";
import { Wipe } from "./Wipe";
import { cn } from "../utils/cn";

const DIFF_META: Record<Difficulty, { label: string; swatch: string }> = {
  casual: { label: "Casual", swatch: "bg-yellow" },
  sharp: { label: "Sharp", swatch: "bg-red" },
  ruthless: { label: "Ruthless", swatch: "bg-blue" },
};

type GameProps = {
  mode: Mode;
  difficulty: Difficulty;
  onExit: () => void;
};

function ScoreChip({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-2 border-ink bg-cream px-3 py-1.5 sm:gap-2.5 sm:px-4 sm:py-2">
      <span className="grid size-5 place-items-center sm:size-6">{icon}</span>
      <span className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-ink/55 min-[420px]:inline sm:text-[10px]">
        {label}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={count}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="font-display text-sm sm:text-base"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="ml-1 inline-flex items-end gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block size-1.5 bg-blue"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.13, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

export function Game({ mode, difficulty, onExit }: GameProps) {
  const humanMark: Mark = "X";
  const botMark: Mark = "O";

  const [board, setBoard] = useState<BoardState>(EMPTY_BOARD);
  const [turn, setTurn] = useState<Mark>("X");
  const [result, setResult] = useState<RoundResult | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });
  const [showPanel, setShowPanel] = useState(false);

  const boardRef = useRef(board);
  const turnRef = useRef(turn);
  const resultRef = useRef(result);
  const panelTimer = useRef<number | null>(null);
  boardRef.current = board;
  turnRef.current = turn;
  resultRef.current = result;

  useEffect(
    () => () => {
      if (panelTimer.current) window.clearTimeout(panelTimer.current);
    },
    []
  );

  const botToMove = mode === "bot" && !result && turn === botMark;

  const finishRound = useCallback((res: RoundResult) => {
    setResult(res);
    setScores((s) =>
      res.kind === "win"
        ? { ...s, [res.mark]: s[res.mark] + 1 }
        : { ...s, D: s.D + 1 }
    );
    if (res.kind === "win") {
      if (mode === "bot" && res.mark === botMark) loseSound();
      else winSound();
    } else {
      drawSound();
    }
    if (panelTimer.current) window.clearTimeout(panelTimer.current);
    panelTimer.current = window.setTimeout(
      () => setShowPanel(true),
      res.kind === "win" ? 1250 : 700
    );
  }, [mode, botMark]);

  const makeMove = useCallback(
    (i: number) => {
      const b = boardRef.current;
      if (b[i] !== null || resultRef.current) return;
      const mark = turnRef.current;
      const next = b.slice() as BoardState;
      next[i] = mark;
      setBoard(next);
      if (mark === "X") placeX();
      else placeO();
      const res = resultOf(next);
      if (res) finishRound(res);
      else setTurn(other(mark));
    },
    [finishRound]
  );

  /* the bot contemplates, then acts */
  useEffect(() => {
    if (!botToMove) return;
    const t = window.setTimeout(() => {
      const i = chooseBotMove(boardRef.current, botMark, difficulty);
      if (i >= 0) makeMove(i);
    }, 560 + Math.random() * 460);
    return () => window.clearTimeout(t);
  }, [botToMove, difficulty, makeMove, botMark]);

  const onCell = (i: number) => {
    if (resultRef.current) return;
    if (mode === "bot" && turnRef.current !== humanMark) return;
    makeMove(i);
  };

  const rematch = () => {
    uiClick();
    if (panelTimer.current) window.clearTimeout(panelTimer.current);
    setShowPanel(false);
    window.setTimeout(() => {
      setBoard(EMPTY_BOARD);
      setResult(null);
      setTurn("X");
    }, 180);
  };

  const clearScores = () => {
    uiClick();
    setScores({ X: 0, O: 0, D: 0 });
  };

  const interactive = !result && !botToMove;
  const anyScore = scores.X + scores.O + scores.D > 0;

  const banner = result
    ? null
    : botToMove
      ? "The bot is weighing its options"
      : mode === "bot"
        ? "Your move — place an X"
        : turn === "X"
          ? "Player one — place an X"
          : "Player two — place an O";

  const bannerMark: Mark = mode === "bot" && turn === botMark ? botMark : turn;

  const panelTitle =
    result?.kind === "draw"
      ? "A clean stalemate"
      : mode === "bot"
        ? result?.mark === humanMark
          ? "Voce venceu"
          : "A maquina ganhou"
        : result?.mark === "X"
          ? "Jogador um ganhous"
          : "Jogador 2 ganhou";

  const panelNote =
    result?.kind === "empate"
      ? "Nove celulas, nenhum vencedor. Perfeitamente balanceado."
      : mode === "bot" && result?.mark === botMark
        ? "A maquina celebra quieta."
        : "A geometria falou.";

  return (
    <motion.section className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-5 px-4 py-8 sm:gap-6 sm:px-8">
      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="flex w-full max-w-[540px] items-center justify-between"
      >
        <BauButton size="sm" variant="ghost" onClick={onExit}>
          <ArrowLeft className="size-3.5" />
          Menu
        </BauButton>
        <Badge className="hidden min-[420px]:inline-flex">
          <span className="inline-block size-2 bg-red" />
          Bauhaus duel
        </Badge>
        {mode === "bot" ? (
          <Badge>
            <span className={cn("inline-block size-2", DIFF_META[difficulty].swatch)} />
            {DIFF_META[difficulty].label}
          </Badge>
        ) : (
          <Badge>
            <span className="inline-block size-2 rounded-full bg-red" />
            Two players
          </Badge>
        )}
      </motion.header>

      {/* scoreboard */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, type: "spring", stiffness: 200, damping: 22 }}
        className="flex items-center gap-2 sm:gap-2.5"
      >
        <ScoreChip
          label={mode === "bot" ? "You" : "Player one"}
          count={scores.X}
          icon={<MiniX className="size-full text-red" />}
        />
        <ScoreChip
          label="Draws"
          count={scores.D}
          icon={<span className="inline-block size-2.5 rounded-full bg-ink" />}
        />
        <ScoreChip
          label={mode === "bot" ? "Bot" : "Player two"}
          count={scores.O}
          icon={<MiniO className="size-full text-blue" />}
        />
      </motion.div>

      {/* turn banner */}
      <div className="flex h-9 items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={banner ?? "result"}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="flex items-center gap-2.5 border-2 border-ink bg-cream px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] sm:text-xs"
          >
            {banner ? (
              <>
                {bannerMark === "X" ? (
                  <MiniX className="size-4 text-red" />
                ) : (
                  <MiniO className="size-4 text-blue" />
                )}
                {banner}
                {botToMove && <ThinkingDots />}
              </>
            ) : (
              <>
                <span className={cn("inline-block size-2.5", result?.kind === "win" ? (result?.mark === "X" ? "bg-red" : "bg-blue") : "bg-yellow")} />
                Round complete
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* board + overlay */}
      <div className="relative w-full max-w-[340px] sm:max-w-[400px]">
        <div className="relative">
          <Board
            board={board}
            win={result?.kind === "win" ? { mark: result.mark, line: result.line } : null}
            interactive={interactive}
            ghostMark={interactive ? turn : null}
            onCell={onCell}
          />
          {result?.kind === "win" && <Burst />}

          {/* round-end panel */}
          <AnimatePresence>
            {showPanel && result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                className="absolute inset-0 z-30 grid place-items-center overflow-hidden border-2 border-ink/0 bg-paper/85 backdrop-blur-[2px]"
              >
                {/* watermark shape */}
                <motion.div
                  className="pointer-events-none absolute inset-0 grid place-items-center opacity-[0.13]"
                  initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 0.13 }}
                  transition={{ type: "spring", stiffness: 120, damping: 16 }}
                >
                  {result.kind === "draw" ? (
                    <div className="size-4/5 rotate-12 bg-yellow" />
                  ) : result.mark === "X" ? (
                    <XMark animate={false} className="size-4/5 text-red" />
                  ) : (
                    <OMark animate={false} className="size-4/5 text-blue" />
                  )}
                </motion.div>

                <div className="relative flex flex-col items-center px-6 text-center">
                  <motion.h2
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.12, type: "spring", stiffness: 220, damping: 20 }}
                    className="font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl"
                  >
                    {panelTitle}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.22, type: "spring", stiffness: 220, damping: 20 }}
                    className="mt-3 text-xs italic text-ink/60 sm:text-sm"
                  >
                    {panelNote}
                  </motion.p>
                  <motion.div
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 20 }}
                    className="mt-6 flex flex-wrap items-center justify-center gap-3"
                  >
                    <BauButton variant={result.kind === "win" && result.mark === "X" ? "red" : result.kind === "win" ? "blue" : "yellow"} size="md" onClick={rematch}>
                      <RefreshCw className="size-3.5" />
                      Rematch
                    </BauButton>
                    <BauButton variant="ghost" size="md" onClick={onExit}>
                      <Home className="size-3.5" />
                      Menu
                    </BauButton>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* under-board controls */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.4 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-2.5">
          <BauButton size="sm" variant="ghost" onClick={rematch}>
            <RefreshCw className="size-3" />
            Restart round
          </BauButton>
          {anyScore && (
            <BauButton size="sm" variant="ghost" onClick={clearScores}>
              <Trash2 className="size-3" />
              Clear scores
            </BauButton>
          )}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-ink/40">
          {mode === "bot" ? "Voce e o x — a maquina e O" : "O X sempre comeca"}
        </p>
      </motion.div>

      <Wipe />
    </motion.section>
  );
}
