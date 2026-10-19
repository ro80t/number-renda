import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { connect } from "void/ws";
import { playSound } from "./useSound";
import {
  LEVELS, PENALTY, charScore, isSuspicious, keyToDigit, normalizeRange, randomWord, rankOf, seededRand, wordBonus,
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

export const useTypingGame = () => {
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
  // battle (room) state
  const room = ref(""); // joined room code, "" = solo
  const players = ref(0);
  const oppScore = ref(0);
  const oppDone = ref(false);
  const roomError = ref(false);
  let socket: ReturnType<typeof connect<"/battle/:room">> | undefined;
  let rand = Math.random;
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
    word.value = randomWord(...range.value, rand);
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
    socket?.send({ type: "score", score: score.value, done: true });
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

  const begin = (r: [number, number], seed?: number) => {
    range.value = r;
    [customMin.value, customMax.value] = r;
    rand = seed === undefined ? Math.random : seededRand(seed);
    oppScore.value = 0;
    oppDone.value = false;
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

  /** Solo: start now. In a room: ask the server, which starts both players with a shared seed. */
  const start = () => {
    const r = localRange();
    if (!room.value) return begin(r);
    if (players.value < 2) return;
    socket?.send({ type: "start", min: r[0], max: r[1], total: total.value, wordLimit: wordLimit.value });
  };

  const leave = () => {
    socket?.close();
    socket = undefined;
    room.value = "";
    players.value = 0;
  };

  const join = (code: string) => {
    leave();
    roomError.value = false;
    room.value = code;
    socket = connect("/battle/:room", { params: { room: code } });
    socket.on("message", (e) => {
      if (e.type === "players") {
        players.value = e.count;
        if (e.count < 2 && phase.value === "play") oppDone.value = true; // opponent left
      } else if (e.type === "start") {
        total.value = e.total;
        wordLimit.value = e.wordLimit;
        begin([e.min, e.max], e.seed);
      } else {
        oppScore.value = e.score;
        oppDone.value = e.done;
      }
    });
    socket.on("close", () => {
      if (room.value === code && !players.value) roomError.value = true; // rejected (full) before joining
    });
  };

  watch(score, (v) => phase.value === "play" && socket?.send({ type: "score", score: v, done: false }));

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
    socket?.close();
    removeEventListener("keydown", onKey);
    clearInterval(timer);
  });

  return {
    level, customMin, customMax, total, wordLimit, phase, word, pos, typed, miss, timeouts, words, score,
    combo, maxCombo, left, totalPct, wordPct, wordLeft, shake, best, newRecord, suspicious,
    title, accuracy, perSec, rank, start,
    room, players, oppScore, oppDone, roomError, join, leave,
  };
};
