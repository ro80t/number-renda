import assert from "node:assert/strict";
import { test } from "node:test";
import { keyToDigit, normalizeRange, randomWord, seededRand } from "./game.ts";

test("game", () => {
  assert.equal(keyToDigit("Digit7"), "7");
  assert.equal(keyToDigit("Numpad3"), "3");
  assert.equal(keyToDigit("KeyA"), null);
  assert.equal(keyToDigit("NumpadAdd"), null);

  for (let i = 0; i < 200; i++) assert.match(randomWord(5, 10), /^\d{5,10}$/);
  assert.equal(randomWord(3, 3).length, 3);
  assert.equal(randomWord(5, 10, () => 0.999).length, 10);

  assert.equal(randomWord(5, 10, seededRand(42)), randomWord(5, 10, seededRand(42)));

  assert.deepEqual(normalizeRange(10, 5), [10, 10]);
  assert.deepEqual(normalizeRange(0, 99), [1, 30]);
  assert.deepEqual(normalizeRange(NaN, NaN), [1, 1]);
});

import { isSuspicious } from "./game.ts";
test("isSuspicious", () => {
  const ts = (n: number, f: (i: number) => number) => Array.from({ length: n }, (_, i) => f(i));
  assert.equal(isSuspicious(ts(30, (i) => i * 100)), true); // metronome
  assert.equal(isSuspicious(ts(30, (i) => i * 5)), true); // too fast
  assert.equal(isSuspicious(ts(30, (i) => i * 200 + (i % 7) * 25)), false); // human-ish
});

import { charScore, rankOf, wordBonus } from "./game.ts";
test("scoring", () => {
  assert.equal(charScore(1), 10);
  assert.equal(charScore(10), 12);
  assert.equal(charScore(500), 20); // capped
  assert.equal(wordBonus(10, 1), 50);
  assert.equal(wordBonus(10, 0.5), 25);
  assert.equal(wordBonus(10, -1), 0);
  assert.deepEqual([70, 45, 25, 5].map(rankOf), ["S", "A", "B", "C"]);
});
