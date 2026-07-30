import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { Bot, Users, Play, Circle, Triangle, Square } from "lucide-react";
import type { Difficulty, Mode } from "../lib/game";
import { uiClick } from "../lib/sound";
import { BauButton } from "./ui";
import { Wipe } from "./Wipe";
import { cn } from "../utils/cn";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};

const rise = {
  hidden: { opacity: 0, y: 34, rotate: -2 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 160, damping: 20 },
  },
};

type MenuProps = {
  mode: Mode;
  difficulty: Difficulty;
  onMode: (m: Mode) => void;
  onDifficulty: (d: Difficulty) => void;
  onStart: () => void;
};

function ModeCard({
  active,
  onSelect,
  accent,
  icon,
  title,
  desc,
  deco,
}: {
  active: boolean;
  onSelect: () => void;
  accent: "red" | "blue";
  icon: ReactNode;
  title: string;
  desc: string;
  deco: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      variants={rise}
      whileHover={{ y: -7 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      onClick={() => {
        uiClick();
        onSelect();
      }}
      className={cn(
        "group relative overflow-hidden border-2 bg-cream p-6 text-left transition-[box-shadow,border-color] duration-200 sm:p-7",
        active
          ? "border-ink shadow-press"
          : "border-ink/25 hover:border-ink hover:shadow-press-sm"
      )}
    >
      {/* giant ghost shape that breathes on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -bottom-12 -right-12 transition-all duration-300 ease-out group-hover:scale-110 group-hover:opacity-100",
          accent === "red" ? "text-red" : "text-blue",
          active ? "opacity-[0.16]" : "opacity-[0.07]"
        )}
      >
        {deco}
      </div>

      {active && (
        <motion.span
          layoutId="mode-tab"
          className={cn(
            "absolute right-0 top-0 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-cream",
            accent === "red" ? "bg-red" : "bg-blue"
          )}
        >
          Active
        </motion.span>
      )}

      <span
        className={cn(
          "mb-5 inline-grid size-12 place-items-center border-2 border-ink transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105",
          accent === "red" ? "bg-red text-cream" : "bg-blue text-cream"
        )}
      >
        {icon}
      </span>
      <span className="block font-display text-xl uppercase leading-none tracking-tight sm:text-2xl">
        {title}
      </span>
      <span className="mt-2.5 block max-w-[26ch] text-sm leading-relaxed text-ink/65">
        {desc}
      </span>
    </motion.button>
  );
}

const DIFFICULTIES: {
  id: Difficulty;
  label: string;
  note: string;
  icon: ReactNode;
  color: string;
}[] = [
  { id: "casual", label: "Casual", note: "Jogue na vibe", icon: <Circle className="size-3.5" />, color: "bg-yellow" },
  { id: "complicado", label: "Sharp", note: "ganha e perde", icon: <Triangle className="size-3.5" />, color: "bg-red" },
  { id: "sem piedade", label: "Ruthless", note: "nao perde", icon: <Square className="size-3.5" />, color: "bg-blue" },
];

export function Menu({ mode, difficulty, onMode, onDifficulty, onStart }: MenuProps) {
  return (
    <motion.section
      exit={{ opacity: 1 }}
      className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-12 sm:px-8"
    >
      <div className="w-full max-w-3xl">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center">
          {/* top rule */}
          <motion.div variants={rise} className="mb-8 flex w-full items-center justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55 sm:mb-10">
            <span className="flex items-center gap-2">
            </span>
            <span className="hidden sm:inline">Forma · Cor · Play</span>
              <span className="inline-block size-2 rounded-full bg-blue" />
            </span>
          </motion.div>

          {/* display title */}
          <h1 className="text-center font-display uppercase leading-[0.92] tracking-tight">
            <motion.span variants={rise} className="block text-[clamp(3.4rem,13vw,7rem)] text-ink">
              JOGO
            </motion.span>
            <motion.span variants={rise} className="block text-[clamp(3.4rem,13vw,7rem)] text-red">
              DA
            </motion.span>
            <motion.span
              variants={rise}
              className="flex items-center justify-center gap-[0.06em] text-[clamp(3.4rem,13vw,7rem)] text-blue"
            >
              V
              E
              L
              H
              A
            </motion.span>
          </h1>

          <motion.p variants={rise} className="mt-5 text-center text-[11px] font-bold uppercase tracking-[0.34em] text-ink/60 sm:text-xs">
            nove celulas — tres formas — um vencedor
          </motion.p>

          {/* mode cards */}
          <div className="mt-10 grid w-full max-w-2xl gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5">
            <ModeCard
              active={mode === "bot"}
              onSelect={() => onMode("bot")}
              accent="blue"
              icon={<Bot className="size-6" strokeWidth={2.2} />}
              title="Contra oe Bot"
              desc="Um pequeno duelo contra uma maquina."
              deco={
                <svg viewBox="0 0 100 100" className="size-44">
                  <circle cx={50} cy={50} r={42} stroke="currentColor" strokeWidth={14} fill="none" />
                </svg>
              }
            />
            <ModeCard
              active={mode === "pvp"}
              onSelect={() => onMode("pvp")}
              accent="red"
              icon={<Users className="size-6" strokeWidth={2.2} />}
              title="Contra um Amigo"
              desc="Passe a tela por ai. tente ai."
              deco={
                <svg viewBox="0 0 100 100" className="size-44">
                  <rect x={10} y={10} width={80} height={80} fill="currentColor" />
                </svg>
              }
            />
          </div>

          {/* bot temperament */}
          <AnimatePresence initial={false}>
            {mode === "bot" && (
              <motion.div
                key="difficulty"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.76, 0, 0.24, 1] }}
                className="w-full max-w-2xl overflow-hidden"
              >
                <div className="pb-1 pt-6 sm:pt-7">
                  <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55">
                    Temperamento do Bot
                  </p>
                  <div className="flex flex-wrap items-stretch justify-center gap-2.5">
                    {DIFFICULTIES.map((d) => {
                      const active = difficulty === d.id;
                      return (
                        <motion.button
                          key={d.id}
                          type="button"
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            uiClick();
                            onDifficulty(d.id);
                          }}
                          className={cn(
                            "flex items-center gap-2.5 border-2 px-4 py-2.5 transition-[box-shadow,background-color] duration-200",
                            active
                              ? "border-ink bg-cream shadow-press-sm"
                              : "border-ink/25 bg-cream/50 hover:border-ink"
                          )}
                        >
                          <span className={cn("grid size-7 place-items-center border border-ink/20 text-ink", d.color)}>
                            {d.icon}
                          </span>
                          <span className="text-left">
                            <span className="block text-[11px] font-bold uppercase tracking-[0.18em]">
                              {d.label}
                            </span>
                            <span className="block text-[10px] italic text-ink/50">{d.note}</span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* start */}
          <motion.div variants={rise} className="mt-10 sm:mt-12">
            <BauButton size="lg" variant="ink" onClick={onStart} className="text-base sm:text-lg">
              <Play className="size-4 fill-current" />
              Comece o jogo
            </BauButton>
          </motion.div>

          <motion.p variants={rise} className="mt-7 text-[10px] font-bold uppercase tracking-[0.28em] text-ink/40">
            X cruz vermelha · O anel azul
          </motion.p>
        </motion.div>
      </div>
      <Wipe />
    </motion.section>
  );
}
