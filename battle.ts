import { PENALTY, charScore, randomWord, wordBonus } from "./game.ts";

/** Server-authoritative race: everyone types the same word; the first correct digit claims the points. */
export type Config = { min: number; max: number; total: number; wordLimit: number };
export type Player = {
  name: string;
  score: number; combo: number; maxCombo: number; typed: number; miss: number; words: number; timeouts: number;
};
export type Battle = {
  phase: "lobby" | "play" | "result";
  cfg: Config;
  word: string;
  pos: number;
  endAt: number;
  wordEndAt: number; // 0 = no per-word limit
  players: Record<string, Player>;
};
/** What clients receive: relative times, so clock skew between machines doesn't matter. */
export type View = {
  phase: Battle["phase"];
  cfg: Config;
  word: string;
  pos: number;
  totalMs: number;
  wordMs: number;
  players: (Player & { id: string; online: boolean })[];
};

/** Connections are named by their display name; blank names fall back to P1, P2, ... */
export type Online = { id: string; name: string };
const fresh = (name: string): Player => ({ name, score: 0, combo: 0, maxCombo: 0, typed: 0, miss: 0, words: 0, timeouts: 0 });

export const lobby = (): Battle => ({
  phase: "lobby", cfg: { min: 5, max: 10, total: 60, wordLimit: 0 }, word: "", pos: 0, endAt: 0, wordEndAt: 0, players: {},
});

const nextWord = (b: Battle, now: number, rand: () => number) => {
  b.word = randomWord(b.cfg.min, b.cfg.max, rand);
  b.pos = 0;
  b.wordEndAt = b.cfg.wordLimit ? now + b.cfg.wordLimit * 1000 : 0;
};

export const start = (online: Online[], cfg: Config, now: number, rand = Math.random): Battle => {
  const b: Battle = {
    phase: "play", cfg, word: "", pos: 0, endAt: now + cfg.total * 1000, wordEndAt: 0,
    players: Object.fromEntries(online.map(({ id, name }, i) => [id, fresh(name || `P${i + 1}`)])),
  };
  nextWord(b, now, rand);
  return b;
};

/** Apply the clock: end the game, or time out the current word for everyone. Mutates `b`. */
export const sync = (b: Battle, now: number, rand = Math.random): Battle => {
  if (b.phase !== "play") return b;
  if (now >= b.endAt) b.phase = "result";
  else if (b.wordEndAt && now >= b.wordEndAt) {
    for (const p of Object.values(b.players)) {
      p.timeouts++;
      p.score = Math.max(0, p.score - PENALTY.timeout);
      p.combo = 0;
    }
    nextWord(b, now, rand);
  }
  return b;
};

/** A player pressed `digit`. Mutates `b`. */
export const key = (b: Battle, id: string, digit: string, now: number, rand = Math.random): Battle => {
  sync(b, now, rand);
  const p = b.players[id];
  if (b.phase !== "play" || !p) return b;
  if (digit !== b.word[b.pos]) {
    p.miss++;
    p.score = Math.max(0, p.score - PENALTY.miss);
    p.combo = 0;
    return b;
  }
  p.typed++;
  p.maxCombo = Math.max(p.maxCombo, ++p.combo);
  p.score += charScore(p.combo);
  if (++b.pos === b.word.length) {
    p.words++; // finishing the word earns the bonus
    p.score += wordBonus(b.word.length, b.cfg.wordLimit ? (b.wordEndAt - now) / (b.cfg.wordLimit * 1000) : 1);
    nextWord(b, now, rand);
  }
  return b;
};

export const view = (b: Battle, online: Online[], now: number): View => ({
  phase: b.phase,
  cfg: b.cfg,
  word: b.word,
  pos: b.pos,
  totalMs: b.phase === "play" ? Math.max(0, b.endAt - now) : 0,
  wordMs: b.phase === "play" && b.wordEndAt ? Math.max(0, b.wordEndAt - now) : 0,
  players:
    b.phase === "lobby"
      ? online.map(({ id, name }, i) => ({ id, online: true, ...fresh(name || `P${i + 1}`) }))
      : Object.entries(b.players).map(([id, p]) => ({ id, online: online.some((o) => o.id === id), ...p })),
});

/** Players by score, highest first, with competition ranking (ties share a place). */
export const ranking = <T extends { score: number }>(players: T[]): (T & { place: number })[] => {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return sorted.map((p, i) => ({ ...p, place: sorted.findIndex((q) => q.score === p.score) + 1 }));
};
