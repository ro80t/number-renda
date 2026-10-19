import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { connect } from "void/ws";
import { playSound } from "./useSound";
import { keyToDigit } from "../game";
import { ranking, type Config, type View } from "../battle";

const TICK_MS = 100;
const SYNC_RETRY_MS = 300;

export const useBattle = () => {
  const NAME_KEY = "number-renda:name";
  const loadName = () => {
    try {
      return localStorage.getItem(NAME_KEY) ?? "";
    } catch {
      return "";
    }
  };
  const live = ref(0); // scoring mode picker: 0 = winner takes the pot, 1 = points per digit
  const name = ref(loadName()); // display name shown to other players
  const room = ref(""); // joined room code, "" = not in a room
  const me = ref("");
  const snap = ref<View | null>(null);
  const at = ref(0); // when `snap` arrived (server times are relative to this)
  const now = ref(Date.now());
  const closed = ref(false); // rejected: full or game in progress
  const shake = ref(false);
  let socket: ReturnType<typeof connect<"/battle/:room">> | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let lastSync = 0;

  const phase = computed(() => snap.value?.phase ?? "lobby");
  const totalMs = computed(() => Math.max(0, (snap.value?.totalMs ?? 0) - (now.value - at.value)));
  const wordMs = computed(() => Math.max(0, (snap.value?.wordMs ?? 0) - (now.value - at.value)));
  const hasWordLimit = computed(() => (snap.value?.cfg.wordLimit ?? 0) > 0);
  const players = computed(() => snap.value?.players ?? []);
  const mine = computed(() => players.value.find((p) => p.id === me.value));
  const ranked = computed(() => ranking(players.value));

  watch(snap, (s, old) => {
    const a = s?.players.find((p) => p.id === me.value);
    const b = old?.players.find((p) => p.id === me.value);
    if (!a || !b || s?.phase !== "play") return;
    if (a.typed > b.typed) playSound("ok");
    if (a.miss > b.miss || a.timeouts > b.timeouts) {
      playSound("miss");
      shake.value = false;
      requestAnimationFrame(() => (shake.value = true));
    }
  });

  const tick = () => {
    now.value = Date.now();
    // the server has no clock of its own: ask it to apply ours once a deadline has passed
    const over = phase.value === "play" && (totalMs.value <= 0 || (hasWordLimit.value && wordMs.value <= 0));
    if (over && now.value - lastSync > SYNC_RETRY_MS) {
      lastSync = now.value;
      socket?.send({ type: "sync" });
    }
  };

  const sendName = () => {
    if (!socket || !me.value) return;
    socket.send({ type: "name", name: name.value });
    try {
      localStorage.setItem(NAME_KEY, name.value.trim());
    } catch {}
  };
  watch(name, sendName);

  const leave = () => {
    socket?.close();
    socket = undefined;
    room.value = me.value = "";
    snap.value = null;
  };

  const join = (code: string) => {
    leave();
    closed.value = false;
    room.value = code;
    socket = connect("/battle/:room", { params: { room: code } });
    socket.on("message", (e) => {
      if (e.type === "you") {
        me.value = e.id;
        sendName();
      }
      else {
        snap.value = e.state;
        at.value = Date.now();
      }
    });
    socket.on("close", () => {
      if (room.value !== code || me.value) return;
      leave(); // never got in: stop the auto-reconnect
      closed.value = true;
    });
  };

  const start = (cfg: Omit<Config, "live">) => socket?.send({ type: "start", ...cfg, live: live.value === 1 });

  const onKey = (e: KeyboardEvent) => {
    if (phase.value !== "play" || !e.isTrusted || e.repeat) return;
    const d = keyToDigit(e.code);
    if (d !== null) socket?.send({ type: "key", digit: d });
  };

  onMounted(() => {
    addEventListener("keydown", onKey);
    timer = setInterval(tick, TICK_MS);
  });
  onUnmounted(() => {
    removeEventListener("keydown", onKey);
    clearInterval(timer);
    socket?.close();
  });

  return { live, name, room, me, phase, snap, totalMs, wordMs, hasWordLimit, players, mine, ranked, closed, shake, join, leave, start };
};
