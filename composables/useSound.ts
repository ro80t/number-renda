import { onMounted, ref, watch } from "vue";

const KEY = "number-renda:settings";
const MAX_GAIN = 0.08; // volume 1.0 is still quiet; default 0.5 -> 0.04
const enabled = ref(true);
const volume = ref(0.5);
let ctx: AudioContext | undefined;

const beep = (freq: number, ms: number, type: OscillatorType) => {
  ctx ??= new AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t = ctx.currentTime;
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(Math.max(MAX_GAIN * volume.value, 0.0002), t);
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

/** Sound settings shared app-wide, persisted in localStorage (default: on). Call once, from a component that is always mounted. */
export const useSoundSettings = () => {
  onMounted(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (typeof s.enabled === "boolean") enabled.value = s.enabled;
      if (typeof s.volume === "number") volume.value = Math.min(1, Math.max(0, s.volume));
    } catch {}
    watch([enabled, volume], () => {
      try {
        localStorage.setItem(KEY, JSON.stringify({ enabled: enabled.value, volume: volume.value }));
      } catch {}
    });
  });
  return { enabled, volume, preview: () => playSound("ok") };
};
