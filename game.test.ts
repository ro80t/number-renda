import assert from "node:assert/strict";
import { test } from "node:test";
import { keyToDigit, normalizeRange, randomWord } from "./game.ts";

test("game", () => {
  assert.equal(keyToDigit("Digit7"), "7");
  assert.equal(keyToDigit("Numpad3"), "3");
  assert.equal(keyToDigit("KeyA"), null);
  assert.equal(keyToDigit("NumpadAdd"), null);

  for (let i = 0; i < 200; i++) assert.match(randomWord(5, 10), /^\d{5,10}$/);
  assert.equal(randomWord(3, 3).length, 3);
  assert.equal(randomWord(5, 10, () => 0.999).length, 10);

  assert.deepEqual(normalizeRange(10, 5), [10, 10]);
  assert.deepEqual(normalizeRange(0, 99), [1, 30]);
  assert.deepEqual(normalizeRange(NaN, NaN), [1, 1]);
});
