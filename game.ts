/** Top-row and numpad digits are treated the same; anything else is null. */
export const keyToDigit = (code: string): string | null =>
  /^(Digit|Numpad)\d$/.test(code) ? code.slice(-1) : null;

export const LEVELS = {
  intro: { label: "入門", min: 1, max: 5 },
  beginner: { label: "初級", min: 5, max: 10 },
  intermediate: { label: "中級", min: 10, max: 15 },
  advanced: { label: "上級", min: 15, max: 20 },
} as const;

export type Level = keyof typeof LEVELS | "custom";

export const CUSTOM_LIMIT = { min: 1, max: 30 };

/** Clamp a user-entered range into CUSTOM_LIMIT, with min <= max. */
export const normalizeRange = (min: number, max: number): [number, number] => {
  const c = (n: number) =>
    Math.min(CUSTOM_LIMIT.max, Math.max(CUSTOM_LIMIT.min, Math.round(n) || CUSTOM_LIMIT.min));
  const lo = c(min);
  return [lo, Math.max(lo, c(max))];
};

/** Random digit string whose length is in [min, max]. */
export const randomWord = (min: number, max: number, rand = Math.random): string => {
  const len = min + Math.floor(rand() * (max - min + 1));
  return Array.from({ length: len }, () => Math.floor(rand() * 10)).join("");
};

/**
 * Heuristic bot check on keystroke timestamps (ms): inhumanly fast gaps or
 * metronome-regular timing. ponytail: client-side only, trivially bypassable; needs a server-side score check if rankings are added.
 */
export const isSuspicious = (times: number[]): boolean => {
  const gaps = times.slice(1).map((t, i) => t - times[i]);
  if (gaps.filter((g) => g < 15).length >= 3) return true;
  if (gaps.length < 20) return false;
  const mean = gaps.reduce((a, b) => a + b) / gaps.length;
  const sd = Math.sqrt(gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / gaps.length);
  return sd < 2;
};

export const TOTAL_OPTIONS = [30, 60, 90, 120] as const;
/** Per-word time limits in seconds; 0 = no limit. */
export const WORD_OPTIONS = [0, 5, 8, 10, 15] as const;
export const PENALTY = { miss: 20, timeout: 30 } as const;

/** Points for a correct digit; the combo (consecutive hits, incl. this one) adds up to +10. */
export const charScore = (combo: number) => 10 + 2 * Math.min(Math.floor(combo / 10), 5);

/** Bonus for finishing a word; `ratio` is the share of the word's time limit still left (1 when unlimited). */
export const wordBonus = (len: number, ratio: number) =>
  Math.round(len * 5 * Math.min(1, Math.max(0, ratio)));

/** Rank from points per second of play time. */
export const rankOf = (perSec: number) =>
  perSec >= 60 ? "S" : perSec >= 40 ? "A" : perSec >= 20 ? "B" : "C";
