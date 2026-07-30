export type Mark = "X" | "O";
export type CellValue = Mark | null;
export type BoardState = CellValue[];
export type Mode = "bot" | "pvp";
export type Difficulty = "casual" | "sharp" | "ruthless";

export type WinLine = readonly [number, number, number];

export const WIN_LINES: readonly WinLine[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const EMPTY_BOARD: BoardState = Array(9).fill(null);

export const other = (m: Mark): Mark => (m === "X" ? "O" : "X");

export function getWinner(b: BoardState): { mark: Mark; line: WinLine } | null {
  for (const line of WIN_LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { mark: b[a] as Mark, line };
    }
  }
  return null;
}

export const isFull = (b: BoardState) => b.every((c) => c !== null);

export type RoundResult =
  | { kind: "win"; mark: Mark; line: WinLine }
  | { kind: "draw" };

export function resultOf(b: BoardState): RoundResult | null {
  const w = getWinner(b);
  if (w) return { kind: "win", mark: w.mark, line: w.line };
  if (isFull(b)) return { kind: "draw" };
  return null;
}

const emptyIndices = (b: BoardState): number[] =>
  b.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** indices where placing `m` completes a line immediately */
const immediateWins = (b: BoardState, m: Mark): number[] =>
  emptyIndices(b).filter((i) => {
    const copy = b.slice();
    copy[i] = m;
    return getWinner(copy)?.mark === m;
  });

/** perfect play via minimax — never loses */
function bestMove(b: BoardState, bot: Mark): number {
  const opp = other(bot);

  const score = (board: BoardState, turn: Mark, depth: number): number => {
    const w = getWinner(board);
    if (w) return w.mark === bot ? 10 - depth : depth - 10;
    if (isFull(board)) return 0;
    const scores = emptyIndices(board).map((i) => {
      const copy = board.slice();
      copy[i] = turn;
      return score(copy, other(turn), depth + 1);
    });
    return turn === bot ? Math.max(...scores) : Math.min(...scores);
  };

  const candidates = emptyIndices(b).map((i) => {
    const copy = b.slice();
    copy[i] = bot;
    return { i, s: score(copy, opp, 1) };
  });
  const max = Math.max(...candidates.map((c) => c.s));
  const best = candidates.filter((c) => c.s === max).map((c) => c.i);
  return pick(best);
}

export function chooseBotMove(b: BoardState, bot: Mark, level: Difficulty): number {
  const opp = other(bot);
  const empties = emptyIndices(b);
  if (empties.length === 0) return -1;

  const wins = immediateWins(b, bot);
  const blocks = immediateWins(b, opp);

  if (level === "casual") {
    // plays for the vibes: mostly random, occasionally clever
    if (wins.length && Math.random() < 0.65) return pick(wins);
    if (blocks.length && Math.random() < 0.3) return pick(blocks);
    return pick(empties);
  }

  if (level === "sharp") {
    if (wins.length) return pick(wins);
    if (blocks.length) return pick(blocks);
    if (b[4] === null) return 4;
    const corners = [0, 2, 6, 8].filter((i) => b[i] === null);
    if (corners.length) return pick(corners);
    return pick(empties);
  }

  return bestMove(b, bot);
}

/** board-space (% of board) center of a cell index */
export const cellCenter = (i: number) => ({
  x: ((i % 3) + 0.5) * (100 / 3),
  y: (Math.floor(i / 3) + 0.5) * (100 / 3),
});

/** extended endpoints for drawing the winning strike-through */
export function strikeLine(line: WinLine) {
  const a = cellCenter(line[0]);
  const c = cellCenter(line[2]);
  const dx = c.x - a.x;
  const dy = c.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ext = 13;
  return {
    x1: a.x - ux * ext,
    y1: a.y - uy * ext,
    x2: c.x + ux * ext,
    y2: c.y + uy * ext,
  };
}
