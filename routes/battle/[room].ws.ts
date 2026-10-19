import * as v from "valibot";
import { defineRoom } from "void/ws";
import { key, lobby, start, sync, view, type Battle, type Online, type View } from "../../battle";
import { CUSTOM_LIMIT, TOTAL_OPTIONS, WORD_OPTIONS, normalizeRange } from "../../game";

const MAX_PLAYERS = 4;
const STATE_KEY = "battle";

const int = (min: number, max: number) =>
  v.pipe(v.number(), v.integer(), v.minValue(min), v.maxValue(max));

export default defineRoom({
  messages: {
    client: v.variant("type", [
      v.object({
        type: v.literal("start"),
        min: int(CUSTOM_LIMIT.min, CUSTOM_LIMIT.max),
        max: int(CUSTOM_LIMIT.min, CUSTOM_LIMIT.max),
        total: int(1, Math.max(...TOTAL_OPTIONS)),
        wordLimit: int(0, Math.max(...WORD_OPTIONS)),
        live: v.boolean(),
      }),
      v.object({ type: v.literal("key"), digit: v.pipe(v.string(), v.regex(/^\d$/)) }),
      v.object({ type: v.literal("name"), name: v.pipe(v.string(), v.trim(), v.maxLength(12)) }),
      v.object({ type: v.literal("sync") }), // clients ping when a clock they track has run out
    ]),
    server: v.variant("type", [
      v.object({ type: v.literal("you"), id: v.string() }),
      v.object({ type: v.literal("state"), state: v.custom<View>(() => true) }),
    ]),
  },
  async onBeforeConnect(ctx) {
    const b = sync(await load(ctx.storage), Date.now());

    if (online(ctx).length >= MAX_PLAYERS || b.phase === "play")
      return new Response("Room is closed", { status: 409 });
  },
  async onConnect(ctx) {
    await ctx.connection.send({ type: "you", id: ctx.connection.id });
    await publish(ctx, await load(ctx.storage));
  },
  async onMessage(ctx, e) {
    const now = Date.now();

    let b = await load(ctx.storage);
    const before = JSON.stringify(b);

    if (e.type === "start") {
      sync(b, now);
      const ids = online(ctx);
      if (b.phase === "play" || ids.length < 2) return;
      const [min, max] = normalizeRange(e.min, e.max);
      b = start(ids, { min, max, total: e.total, wordLimit: e.wordLimit, live: e.live }, now);
    } else if (e.type === "name") {
      ctx.connection.setState({ name: e.name });
      await publish(ctx, b);
      return;
    } else if (e.type === "key") key(b, ctx.connection.id, e.digit, now);
    else sync(b, now);

    // ponytail: input is trusted per keypress (no rate limit); add one if a bot player shows up.
    if (JSON.stringify(b) !== before) await publish(ctx, b);
  },
  async onClose(ctx) {
    const rest = online(ctx).filter((o) => o.id !== ctx.connection.id);
    await publish(ctx, rest.length ? await load(ctx.storage) : lobby(), rest);
  },
});

type Ctx = {
  room: {
    getConnections(): Iterable<{ id: string; state: unknown }>;
    broadcast(e: { type: "state"; state: View }): Promise<void>;
  };
};

const online = (ctx: Ctx): Online[] =>
  [...ctx.room.getConnections()].map((c) => ({
    id: c.id,
    name: (c.state as { name?: string } | null)?.name ?? "",
  }));

const load = async (storage: DurableObjectStorage) =>
  (await storage.get<Battle>(STATE_KEY)) ?? lobby();

const publish = async (
  ctx: Ctx & { storage: DurableObjectStorage },
  b: Battle,
  ids: Online[] = online(ctx),
) => {
  await ctx.storage.put(STATE_KEY, b);
  await ctx.room.broadcast({ type: "state", state: view(b, ids, Date.now()) });
};
