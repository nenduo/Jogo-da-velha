import { motion } from "framer-motion";

const STRIPES = ["#d53a2b", "#f0b019", "#1e4f9e"];

/**
 * Tri-colour curtain: covers the screen when a screen unmounts,
 * rolls away when the next screen mounts.
 */
export function Wipe() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex" aria-hidden="true">
      {STRIPES.map((color, i) => (
        <motion.div
          key={color}
          className="h-full flex-1"
          style={{ backgroundColor: color, originY: 0 }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{
            duration: 0.5,
            delay: i * 0.07,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      ))}
    </div>
  );
}
