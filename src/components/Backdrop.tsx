import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

/** floating geometric shapes that gently parallax with the pointer */
export function Backdrop() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 46, damping: 16, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 46, damping: 16, mass: 0.6 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  const farX = useTransform(sx, (v) => v * 26);
  const farY = useTransform(sy, (v) => v * 20);
  const nearX = useTransform(sx, (v) => v * -52);
  const nearY = useTransform(sy, (v) => v * -40);
  const midX = useTransform(sx, (v) => v * 40);
  const midY = useTransform(sy, (v) => v * -28);

  const float = (dur: number, delay = 0) => ({
    animate: { y: [0, -14, 0], rotate: [0, 5, 0] },
    transition: {
      duration: dur,
      delay,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  });

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* warm light pooling in the middle of the paper */}
      <div className="absolute inset-0 bg-[radial-gradient(72%_60%_at_50%_42%,#f8f1e1_0%,#efe6d0_62%,#e9dcc0_100%)]" />

      {/* long ink diagonal */}
      <motion.div
        className="absolute -left-[15%] bottom-[18%] h-[7px] w-[135%] origin-left -rotate-[7deg] bg-ink/90"
        style={{ x: midX }}
      />

      {/* great red ring — top left */}
      <motion.div
        className="absolute -top-14 left-[3%] sm:left-[7%]"
        style={{ x: farX, y: farY }}
      >
        <motion.svg
          viewBox="0 0 120 120"
          className="size-36 text-red sm:size-52"
          {...float(9)}
        >
          <circle cx={60} cy={60} r={42} stroke="currentColor" strokeWidth={17} fill="none" />
        </motion.svg>
      </motion.div>

      {/* yellow disc — right side */}
      <motion.div
        className="absolute right-[6%] top-[13%] sm:right-[12%]"
        style={{ x: nearX, y: nearY }}
      >
        <motion.div className="size-14 bg-yellow sm:size-24" style={{ borderRadius: "50%" }} {...float(7, 0.6)} />
      </motion.div>

      {/* blue triangle — bottom right */}
      <motion.div
        className="absolute bottom-[7%] right-[4%] sm:right-[9%]"
        style={{ x: midX, y: midY }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="size-28 text-blue sm:size-44"
          {...float(10, 1.2)}
        >
          <polygon points="50,6 96,92 4,92" fill="currentColor" />
        </motion.svg>
      </motion.div>

      {/* ink quarter-disc — top right corner (desktop) */}
      <motion.div
        className="absolute -right-10 -top-10 hidden md:block"
        style={{ x: farX, y: farY }}
      >
        <motion.svg viewBox="0 0 100 100" className="size-44 text-ink" {...float(11, 0.3)}>
          <circle cx={100} cy={0} r={64} fill="currentColor" />
        </motion.svg>
      </motion.div>

      {/* blue semicircle — left edge, lower */}
      <motion.div
        className="absolute bottom-[28%] -left-8 hidden sm:block"
        style={{ x: nearX, y: farY }}
      >
        <motion.svg viewBox="0 0 100 50" className="w-32 rotate-90 text-blue lg:w-44" {...float(8, 2)}>
          <path d="M0 50 A50 50 0 0 1 100 50 Z" fill="currentColor" />
        </motion.svg>
      </motion.div>

      {/* dotted grid — bottom left (desktop) */}
      <motion.div className="absolute bottom-[9%] left-[6%] hidden md:block" style={{ x: farX, y: nearY }}>
        <motion.svg viewBox="0 0 96 96" className="size-28 text-ink lg:size-36" {...float(9, 1.6)}>
          {Array.from({ length: 25 }).map((_, i) => (
            <circle
              key={i}
              cx={8 + (i % 5) * 20}
              cy={8 + Math.floor(i / 5) * 20}
              r={3.4}
              fill="currentColor"
            />
          ))}
        </motion.svg>
      </motion.div>

      {/* yellow arc — upper middle-left (desktop) */}
      <motion.div className="absolute left-[16%] top-[24%] hidden lg:block" style={{ x: nearX, y: midY }}>
        <motion.svg viewBox="0 0 100 100" className="size-24 text-yellow" {...float(7.5, 0.9)}>
          <path
            d="M5 95 A90 90 0 0 1 95 5"
            stroke="currentColor"
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
          />
        </motion.svg>
      </motion.div>

      {/* red cross — mid right (desktop) */}
      <motion.div className="absolute right-[18%] top-[34%] hidden lg:block" style={{ x: midX, y: farY }}>
        <motion.svg viewBox="0 0 40 40" className="size-10 text-red" {...float(6.5, 2.4)}>
          <rect x={16} y={0} width={8} height={40} fill="currentColor" />
          <rect x={0} y={16} width={40} height={8} fill="currentColor" />
        </motion.svg>
      </motion.div>

      {/* small ink ring — lower middle (desktop) */}
      <motion.div className="absolute bottom-[30%] right-[30%] hidden xl:block" style={{ x: farX, y: nearY }}>
        <motion.svg viewBox="0 0 60 60" className="size-14 text-ink" {...float(8.5, 1.1)}>
          <circle cx={30} cy={30} r={20} stroke="currentColor" strokeWidth={9} fill="none" />
        </motion.svg>
      </motion.div>
    </div>
  );
}
