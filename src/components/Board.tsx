import { AnimatePresence, motion } from "framer-motion";
import type { BoardState, Mark, WinLine } from "../lib/game";
import { strikeLine } from "../lib/game";
import { OMark, XMark } from "./Marks";
import { cn } from "../utils/cn";

type BoardProps = {
  board: BoardState;
  win: { mark: Mark; line: WinLine } | null;
  interactive: boolean;
  ghostMark: Mark | null;
  onCell: (i: number) => void;
};

const markColor = (m: Mark) => (m === "X" ? "text-red" : "text-blue");

function Cell({
  value,
  index,
  hoverable,
  ghostMark,
  dimmed,
  onClick,
}: {
  value: Mark | null;
  index: number;
  hoverable: boolean;
  ghostMark: Mark | null;
  dimmed: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.5, rotate: index % 2 === 0 ? -6 : 6 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.08 + index * 0.05, type: "spring", stiffness: 320, damping: 23 }}
      onClick={onClick}
      disabled={!hoverable}
      aria-label={`cell ${index + 1}`}
      className={cn(
        "group relative aspect-square bg-cream outline-none transition-colors duration-200",
        hoverable ? "cursor-pointer hover:bg-sand/70 focus-visible:bg-sand/70" : "cursor-default",
        dimmed && value ? "opacity-40" : "opacity-100"
      )}
    >
      {/* placed mark — pops in with a spring, strokes draw themselves */}
      <AnimatePresence mode="popLayout">
        {value && (
          <motion.div
            key={value}
            className={cn("absolute inset-0 grid place-items-center", markColor(value))}
            initial={{ scale: 0.3, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 21 }}
          >
            {value === "X" ? (
              <XMark className="h-3/5 w-3/5" />
            ) : (
              <OMark className="h-3/5 w-3/5" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ghost preview of the current mark on hover */}
      {hoverable && ghostMark && (
        <div className="pointer-events-none absolute inset-0 grid scale-[0.82] place-items-center opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:scale-100 group-hover:opacity-100">
          <div className={cn("h-3/5 w-3/5 opacity-25", markColor(ghostMark))}>
            {ghostMark === "X" ? (
              <XMark animate={false} className="h-full w-full" />
            ) : (
              <OMark animate={false} className="h-full w-full" />
            )}
          </div>
        </div>
      )}
    </motion.button>
  );
}

/** the winning strike-through, drawn across the board */
function Strike({ win }: { win: { mark: Mark; line: WinLine } }) {
  const { x1, y1, x2, y2 } = strikeLine(win.line);
  const path = `M ${x1} ${y1} L ${x2} ${y2}`;
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d={path}
        fill="none"
        stroke="#1a1611"
        strokeWidth={4.6}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={win.mark === "X" ? "#d53a2b" : "#1e4f9e"}
        strokeWidth={2.4}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.42, duration: 0.46, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}

export function Board({ board, win, interactive, ghostMark, onCell }: BoardProps) {
  return (
    <div className="relative">
      {/* bauhaus corner accents behind the frame */}
      <motion.div
        className="absolute -left-3 -top-3 z-0 size-10 bg-red sm:-left-4 sm:-top-4 sm:size-14"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 18 }}
      />
      <motion.div
        className="absolute -bottom-3 -right-3 z-0 size-10 rounded-full bg-yellow sm:-bottom-4 sm:-right-4 sm:size-14"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.62, type: "spring", stiffness: 300, damping: 18 }}
      />
      <motion.div
        className="absolute -right-2 -top-2 z-0 hidden size-6 rotate-45 bg-blue sm:block"
        initial={{ scale: 0, rotate: 45 }}
        animate={{ scale: 1, rotate: 45 }}
        transition={{ delay: 0.72, type: "spring", stiffness: 300, damping: 18 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="relative z-10"
      >
        <div className="relative border-[5px] border-ink bg-ink shadow-press-lg sm:border-[6px]">
          <div className="grid grid-cols-3 gap-[5px] bg-ink sm:gap-[6px]">
            {board.map((value, i) => (
              <Cell
                key={i}
                value={value}
                index={i}
                hoverable={interactive && value === null}
                ghostMark={ghostMark}
                dimmed={!!win && !win.line.includes(i)}
                onClick={() => onCell(i)}
              />
            ))}
          </div>
          {win && <Strike win={win} />}
        </div>
      </motion.div>
    </div>
  );
}
