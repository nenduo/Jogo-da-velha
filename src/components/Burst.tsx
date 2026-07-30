import { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ["#d53a2b", "#1e4f9e", "#f0b019", "#1a1611"];

/** radial burst of circles / squares / triangles when someone wins */
export function Burst({ count = 28 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        const dist = 100 + Math.random() * 150;
        const shapeSeed = Math.random();
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 24,
          r: Math.random() * 280 - 140,
          s: 7 + Math.random() * 12,
          c: COLORS[Math.floor(Math.random() * COLORS.length)],
          round: shapeSeed < 0.34,
          triangle: shapeSeed >= 0.68,
          dur: 0.9 + Math.random() * 0.55,
        };
      }),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      {pieces.map((p, i) => (
        <div key={i} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.span
            className="block"
            style={{
              width: p.s,
              height: p.s,
              backgroundColor: p.c,
              borderRadius: p.round ? "50%" : 0,
              clipPath: p.triangle ? "polygon(50% 0, 0 100%, 100% 100%)" : undefined,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.5, rotate: p.r }}
            transition={{ duration: p.dur, delay: 0.45, ease: [0.16, 0.6, 0.4, 1] }}
          />
        </div>
      ))}
    </div>
  );
}
