import * as v from "valibot";
import { defineRoom } from "void/ws";
import { CUSTOM_LIMIT, TOTAL_OPTIONS, WORD_OPTIONS } from "../../game";

const int = (min: number, max: number) => v.pipe(v.number(), v.integer(), v.minValue(min), v.maxValue(max));
const MAX_PLAYERS = 2;

const Config = {
  min: int(CUSTOM_LIMIT.min, CUSTOM_LIMIT.max),
  max: int(CUSTOM_LIMIT.min, CUSTOM_LIMIT.max),
  total: int(1, Math.max(...TOTAL_OPTIONS)),
  wordLimit: int(0, Math.max(...WORD_OPTIONS)),
};

export default defineRoom({
  messages: {
    client: v.variant("type", [
      v.object({ type: v.literal("start"), ...Config }),
      v.object({ type: v.literal("score"), score: int(0, 1e6), done: v.boolean() }),
    ]),
    server: v.variant("type", [
      v.object({ type: v.literal("players"), count: v.number() }),
      v.object({ type: v.literal("start"), seed: v.number(), ...Config }),
      v.object({ type: v.literal("score"), score: v.number(), done: v.boolean() }),
    ]),
  },
  onBeforeConnect(ctx) {
    if ([...ctx.room.getConnections()].length >= MAX_PLAYERS) return new Response("Room is full", { status: 409 });
  },
  async onConnect(ctx) {
    await ctx.room.broadcast({ type: "players", count: [...ctx.room.getConnections()].length });
  },
  async onMessage(ctx, e) {
    if (e.type === "score") return ctx.room.broadcast(e, [ctx.connection.id]);
    if ([...ctx.room.getConnections()].length < MAX_PLAYERS) return;
    // ponytail: scores are client-reported and trusted; add server-side verification if cheating matters.
    await ctx.room.broadcast({ ...e, seed: crypto.getRandomValues(new Uint32Array(1))[0] });
  },
  async onClose(ctx) {
    const count = [...ctx.room.getConnections()].filter((c) => c.id !== ctx.connection.id).length;
    await ctx.room.broadcast({ type: "players", count });
  },
});
