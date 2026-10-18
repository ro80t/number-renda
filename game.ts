/** Top-row and numpad digits are treated the same; anything else is null. */
export const keyToDigit = (code: string): string | null =>
  /^(Digit|Numpad)\d$/.test(code) ? code.slice(-1) : null;

export const LEVELS = {
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
