import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type BauButtonProps = HTMLMotionProps<"button"> & {
  variant?: "ink" | "red" | "blue" | "yellow" | "ghost";
  size?: "sm" | "md" | "lg";
};

const VARIANTS: Record<NonNullable<BauButtonProps["variant"]>, string> = {
  ink: "bg-ink text-cream border-ink hover:bg-red",
  red: "bg-red text-cream border-ink",
  blue: "bg-blue text-cream border-ink",
  yellow: "bg-yellow text-ink border-ink",
  ghost:
    "bg-cream/60 text-ink border-ink shadow-none hover:bg-ink hover:text-cream",
};

const SIZES: Record<NonNullable<BauButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-[11px] gap-1.5",
  md: "px-5 py-2.5 text-xs gap-2",
  lg: "px-8 py-4 text-sm gap-2.5",
};

/** blocky bauhaus push-button — offset solid shadow, presses down on tap */
export function BauButton({
  children,
  className,
  variant = "ink",
  size = "md",
  ...rest
}: BauButtonProps) {
  const solid = variant !== "ghost";
  return (
    <motion.button
      whileHover={{ x: -2, y: -2 }}
      whileTap={{ x: 2, y: 2 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      className={cn(
        "no-touch-callout inline-flex cursor-pointer select-none items-center justify-center border-2 font-bold uppercase tracking-[0.18em] transition-colors duration-200",
        solid &&
          "shadow-press-sm hover:shadow-press active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/** small bordered label chip with an optional geometric knot */
export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border-2 border-ink bg-cream px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em]",
        className
      )}
    >
      {children}
    </span>
  );
}
