import { onMounted, ref } from "vue";

const KEY = "number-renda:sound";
const enabled = ref(true);
let ctx: AudioContext | undefined;

const beep = (freq: number, ms: number, type: OscillatorType) => {
  ctx ??= new AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t = ctx.currentTime;
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.04, t); // quiet on purpose
  g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + ms / 1000);
};

export const playSound = (kind: "ok" | "miss") => {
  if (!enabled.value) return;
  try {
    if (kind === "ok") beep(880, 60, "sine");
    else beep(160, 140, "triangle");
  } catch {
    // audio unavailable: stay silent
  }
};

/** Shared on/off switch, persisted in localStorage (default on). */
export const useSoundSetting = () => {
  onMounted(() => {
    try {
      enabled.value = localStorage.getItem(KEY) !== "off";
    } catch {}
  });
  const set = (v: boolean) => {
    enabled.value = v;
    try {
      localStorage.setItem(KEY, v ? "on" : "off");
    } catch {}
  };
  return { soundOn: enabled, setSound: set };
};
