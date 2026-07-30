/* tiny WebAudio synth — no assets, just short geometric blips */

let ctx: AudioContext | null = null;

const getCtx = () => {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

type Blip = {
  from: number;
  to?: number;
  dur?: number;
  vol?: number;
  type?: OscillatorType;
  at?: number;
};

function blip({ from, to, dur = 0.12, vol = 0.08, type = "sine", at = 0 }: Blip) {
  const c = getCtx();
  if (!c) return;
  try {
    const t0 = c.currentTime + at;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    /* silence is also design */
  }
}

export const uiClick = () => blip({ from: 640, to: 520, dur: 0.06, vol: 0.045, type: "square" });

export const placeX = () => {
  blip({ from: 170, to: 95, dur: 0.14, vol: 0.1, type: "triangle" });
  blip({ from: 340, to: 240, dur: 0.09, vol: 0.05, type: "square", at: 0.03 });
};

export const placeO = () => {
  blip({ from: 520, to: 410, dur: 0.16, vol: 0.085, type: "sine" });
  blip({ from: 780, to: 620, dur: 0.1, vol: 0.03, type: "sine", at: 0.02 });
};

export const winSound = () => {
  [392, 523.25, 659.25, 783.99].forEach((f, i) =>
    blip({ from: f, dur: 0.16, vol: 0.07, type: "square", at: i * 0.1 })
  );
};

export const loseSound = () => {
  [440, 349.23, 261.63].forEach((f, i) =>
    blip({ from: f, to: f * 0.94, dur: 0.2, vol: 0.06, type: "triangle", at: i * 0.13 })
  );
};

export const drawSound = () => {
  blip({ from: 329.63, dur: 0.14, vol: 0.06, type: "triangle" });
  blip({ from: 293.66, dur: 0.2, vol: 0.06, type: "triangle", at: 0.14 });
};
