import { computed, onMounted, onUnmounted, ref, type Ref } from "vue";
import { playSound } from "./useSound";
import {
  LEVELS, PENALTY, charScore, isSuspicious, keyToDigit, normalizeRange, randomWord, rankOf, wordBonus,
  type Level,
} from "../game";

const BEST_KEY = "number-renda:best";
const TICK_MS = 100;

const loadBest = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? "{}");
  } catch {
    return {};
  }
};

/** `paused`: a battle owns the keyboard, so solo keys are ignored. */
export const useTypingGame = (paused: Ref<boolean>) => {
  const level = ref<Level>("beginner");
  const customMin = ref(5);
  const customMax = ref(10);
  const total = ref(60); // whole-game time limit (s)
  const wordLimit = ref(10); // per-word time limit (s), 0 = off
  const phase = ref<"idle" | "play" | "result">("idle");
  const range = ref<[number, number]>([5, 10]);
  const word = ref("");
  const pos = ref(0);
  const typed = ref(0);
  const miss = ref(0);
  const timeouts = ref(0);
  const words = ref(0);
  const score = ref(0);
  const combo = ref(0);
  const maxCombo = ref(0);
  const totalMs = ref(0);
  const wordMs = ref(0);
  const elapsed = ref(1);
  const best = ref(0);
  const newRecord = ref(false);
  const shake = ref(false);
  const suspicious = ref(false);
  let times: number[] = [];
  let last = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  const title = computed(
    () => `${level.value === "custom" ? "カスタム" : LEVELS[level.value].label} ${range.value[0]}〜${range.value[1]}桁`,
  );
  const configKey = () => `${range.value.join("-")}|${total.value}|${wordLimit.value}`;
  const left = computed(() => Math.ceil(totalMs.value / 1000));
  const totalPct = computed(() => (totalMs.value / (total.value * 1000)) * 100);
  const wordPct = computed(() => (wordLimit.value ? (wordMs.value / (wordLimit.value * 1000)) * 100 : 100));
  const wordLeft = computed(() => (Math.max(0, wordMs.value) / 1000).toFixed(1));
  const accuracy = computed(() =>
    typed.value + miss.value ? Math.round((typed.value / (typed.value + miss.value)) * 100) : 0,
  );
  const perSec = computed(() => (typed.value / elapsed.value).toFixed(1));
  const rank = computed(() => rankOf(score.value / elapsed.value));

  const next = () => {
    word.value = randomWord(...range.value);
    pos.value = 0;
    wordMs.value = wordLimit.value * 1000;
  };

  const penalize = (points: number) => {
    score.value = Math.max(0, score.value - points);
    combo.value = 0;
    playSound("miss");
    shake.value = false;
    requestAnimationFrame(() => (shake.value = true));
  };

  const finish = () => {
    clearInterval(timer);
    elapsed.value = Math.max(1, total.value - totalMs.value / 1000);
    suspicious.value = isSuspicious(times);
    const prev = loadBest();
    const old = prev[configKey()] ?? 0;
    best.value = Math.max(old, suspicious.value ? 0 : score.value);
    newRecord.value = !suspicious.value && score.value > old;
    if (newRecord.value) {
      try {
        localStorage.setItem(BEST_KEY, JSON.stringify({ ...prev, [configKey()]: score.value }));
      } catch {}
    }
    phase.value = "result";
  };

  const tick = () => {
    const now = Date.now();
    const dt = now - last;
    last = now;
    totalMs.value -= dt;
    if (totalMs.value <= 0) {
      totalMs.value = 0;
      return finish();
    }
    if (wordLimit.value && (wordMs.value -= dt) <= 0) {
      timeouts.value++;
      penalize(PENALTY.timeout);
      next();
    }
  };

  const localRange = (): [number, number] =>
    level.value === "custom"
      ? normalizeRange(customMin.value, customMax.value)
      : [LEVELS[level.value].min, LEVELS[level.value].max];

  /** Settings for a battle, from the same pickers as solo play. */
  const config = () => {
    const [min, max] = localRange();
    return { min, max, total: total.value, wordLimit: wordLimit.value };
  };

  const start = () => {
    range.value = localRange();
    [customMin.value, customMax.value] = range.value;
    typed.value = miss.value = timeouts.value = words.value = score.value = combo.value = maxCombo.value = 0;
    times = [];
    totalMs.value = total.value * 1000;
    best.value = loadBest()[configKey()] ?? 0;
    next();
    phase.value = "play";
    clearInterval(timer);
    last = Date.now();
    timer = setInterval(tick, TICK_MS);
  };

  const onKey = (e: KeyboardEvent) => {
    if (paused.value) return;
    if (phase.value !== "play") {
      // buttons/inputs handle their own Enter/Space
      if ((e.code === "Space" || e.code === "Enter") && e.target === document.body) start();
      return;
    }
    if (e.code === "Escape") return finish();
    if (!e.isTrusted || e.repeat) return; // synthetic events (scripts) and held keys
    const d = keyToDigit(e.code);
    if (d === null) return;
    if (d !== word.value[pos.value]) {
      miss.value++;
      penalize(PENALTY.miss);
      return;
    }
    typed.value++;
    times.push(e.timeStamp);
    playSound("ok");
    maxCombo.value = Math.max(maxCombo.value, ++combo.value);
    score.value += charScore(combo.value);
    if (++pos.value === word.value.length) {
      words.value++;
      score.value += wordBonus(word.value.length, wordLimit.value ? wordMs.value / (wordLimit.value * 1000) : 1);
      next();
    }
  };

  onMounted(() => addEventListener("keydown", onKey));
  onUnmounted(() => {
    removeEventListener("keydown", onKey);
    clearInterval(timer);
  });

  return {
    level, customMin, customMax, total, wordLimit, phase, word, pos, typed, miss, timeouts, words, score,
    combo, maxCombo, left, totalPct, wordPct, wordLeft, shake, best, newRecord, suspicious,
    title, accuracy, perSec, rank, start, config,
  };
};
