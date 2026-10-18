import { computed, onMounted, onUnmounted, ref } from "vue";
import { playSound } from "./useSound";
import { LEVELS, isSuspicious, keyToDigit, normalizeRange, randomWord, type Level } from "../game";

export const LIMIT = 60;

export const useTypingGame = () => {
  const level = ref<Level>("beginner");
  const customMin = ref(5);
  const customMax = ref(10);
  const phase = ref<"idle" | "play" | "result">("idle");
  const range = ref<[number, number]>([5, 10]);
  const word = ref("");
  const pos = ref(0);
  const typed = ref(0);
  const miss = ref(0);
  const words = ref(0);
  const left = ref(LIMIT);
  const shake = ref(false);
  let times: number[] = [];
  const suspicious = ref(false);
  let timer: ReturnType<typeof setInterval> | undefined;

  const title = computed(
    () => `${level.value === "custom" ? "カスタム" : LEVELS[level.value].label} ${range.value[0]}〜${range.value[1]}桁`,
  );
  const accuracy = computed(() =>
    typed.value + miss.value ? Math.round((typed.value / (typed.value + miss.value)) * 100) : 0,
  );
  const perSec = computed(() => (typed.value / LIMIT).toFixed(1));

  const next = () => {
    word.value = randomWord(...range.value);
    pos.value = 0;
  };

  const finish = () => {
    clearInterval(timer);
    suspicious.value = isSuspicious(times);
    phase.value = "result";
  };

  const start = () => {
    range.value =
      level.value === "custom"
        ? normalizeRange(customMin.value, customMax.value)
        : [LEVELS[level.value].min, LEVELS[level.value].max];
    [customMin.value, customMax.value] = range.value;
    typed.value = miss.value = words.value = 0;
    times = [];
    left.value = LIMIT;
    next();
    phase.value = "play";
    clearInterval(timer);
    timer = setInterval(() => --left.value <= 0 && finish(), 1000);
  };

  const onKey = (e: KeyboardEvent) => {
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
      playSound("miss");
      shake.value = false;
      requestAnimationFrame(() => (shake.value = true));
      return;
    }
    typed.value++;
    playSound("ok");
    times.push(e.timeStamp);
    if (++pos.value === word.value.length) {
      words.value++;
      next();
    }
  };

  onMounted(() => addEventListener("keydown", onKey));
  onUnmounted(() => {
    removeEventListener("keydown", onKey);
    clearInterval(timer);
  });

  return {
    level, customMin, customMax, phase, suspicious, word, pos, typed, miss, words, left, shake,
    title, accuracy, perSec, start,
  };
};
