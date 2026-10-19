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

import { key, lobby, ranking, start, sync, view } from "./battle.ts";

test("battle", () => {
  const cfg = { min: 3, max: 3, total: 10, wordLimit: 5, live: false };
  const rand = () => 0; // word "000"
  const b = start(
    [
      { id: "a", name: "" },
      { id: "b", name: "Bob" },
    ],
    cfg,
    0,
    rand,
  );
  assert.equal(b.word, "000");
  assert.deepEqual([b.players.a.name, b.players.b.name], ["P1", "Bob"]);

  key(b, "a", "0", 100, rand);
  key(b, "b", "1", 110, rand); // b misses: no progress
  key(b, "b", "0", 120, rand);
  assert.deepEqual(
    [b.players.a.pos, b.players.b.pos, b.players.b.miss, b.players.a.score],
    [1, 1, 1, 0],
  );

  key(b, "a", "0", 130, rand);
  key(b, "a", "0", 140, rand); // a finishes first: takes the pot (own 30 + b's 10) and the bonus
  assert.equal(b.players.a.words, 1);
  assert.ok(b.players.a.score >= 40 && b.players.b.score === 0);
  assert.deepEqual([b.players.a.pos, b.players.b.pos, b.players.b.pending], [0, 0, 0]);

  sync(b, 6000, rand); // word timed out for everyone
  assert.equal(b.players.a.timeouts, 1);
  sync(b, 10000, rand);
  assert.equal(b.phase, "result");

  const r = ranking(
    view(
      b,
      [
        { id: "a", name: "" },
        { id: "b", name: "Bob" },
      ],
      10000,
    ).players,
  );
  assert.equal(r[0].id, "a");
  // live mode: digits pay immediately, the finisher keeps only the bonus on top
  const l = start(
    [
      { id: "a", name: "" },
      { id: "b", name: "" },
    ],
    { ...cfg, live: true },
    0,
    rand,
  );
  key(l, "a", "0", 10, rand);
  key(l, "b", "0", 20, rand);
  assert.deepEqual([l.players.a.score, l.players.b.score, l.players.a.pending], [10, 10, 0]);
  key(l, "a", "0", 30, rand);
  key(l, "a", "0", 40, rand);
  assert.ok(l.players.a.score >= 30 && l.players.b.score === 10);

  assert.deepEqual(
    ranking([{ score: 5 }, { score: 5 }, { score: 1 }]).map((p) => p.place),
    [1, 1, 3],
  );
  assert.equal(view(lobby(), [{ id: "x", name: "X" }], 0).players.length, 1);
});
