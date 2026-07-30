import { motion } from "framer-motion";

type MarkProps = {
  className?: string;
  animate?: boolean;
};

/** red X — two strokes draw themselves in */
export function XMark({ className = "", animate = true }: MarkProps) {
  const t = (delay: number) =>
    animate
      ? { duration: 0.32, delay, ease: [0.65, 0, 0.35, 1] as const }
      : { duration: 0 };
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none">
      <motion.line
        x1={26}
        y1={26}
        x2={74}
        y2={74}
        stroke="currentColor"
        strokeWidth={15}
        strokeLinecap="round"
        initial={{ pathLength: animate ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={t(0)}
      />
      <motion.line
        x1={74}
        y1={26}
        x2={26}
        y2={74}
        stroke="currentColor"
        strokeWidth={15}
        strokeLinecap="round"
        initial={{ pathLength: animate ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={t(animate ? 0.09 : 0)}
      />
    </svg>
  );
}

/** blue O — the circle traces itself */
export function OMark({ className = "", animate = true }: MarkProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none">
      <motion.circle
        cx={50}
        cy={50}
        r={25}
        stroke="currentColor"
        strokeWidth={15}
        initial={{ pathLength: animate ? 0 : 1, rotate: -90 }}
        animate={{ pathLength: 1 }}
        style={{ transformOrigin: "50% 50%" }}
        transition={
          animate
            ? { duration: 0.42, ease: [0.65, 0, 0.35, 1] as const }
            : { duration: 0 }
        }
      />
    </svg>
  );
}

/** tiny static shapes used in chips / headers */
export function MiniX({ className = "" }: { className?: string }) {
  return <XMark animate={false} className={className} />;
}

export function MiniO({ className = "" }: { className?: string }) {
  return <OMark animate={false} className={className} />;
}
