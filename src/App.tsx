import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Backdrop } from "./components/Backdrop";
import { Game } from "./components/Game";
import { Menu } from "./components/Menu";
import type { Difficulty, Mode } from "./lib/game";
import { uiClick } from "./lib/sound";

export default function App() {
  const [screen, setScreen] = useState<"menu" | "game">("menu");
  const [mode, setMode] = useState<Mode>("bot");
  const [difficulty, setDifficulty] = useState<Difficulty>("sharp");

  return (
    <div className="relative min-h-dvh overflow-hidden font-sans text-ink">
      <Backdrop />
      <AnimatePresence mode="wait">
        {screen === "menu" ? (
          <Menu
            key="menu"
            mode={mode}
            difficulty={difficulty}
            onMode={setMode}
            onDifficulty={setDifficulty}
            onStart={() => {
              uiClick();
              setScreen("game");
            }}
          />
        ) : (
          <Game
            key={`game-${mode}-${difficulty}`}
            mode={mode}
            difficulty={difficulty}
            onExit={() => {
              uiClick();
              setScreen("menu");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
