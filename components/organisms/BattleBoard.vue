<script setup lang="ts">
import { computed } from "vue";
import ProgressBar from "../atoms/ProgressBar.vue";
import type { Player } from "../../battle";

const props = defineProps<{
  word: string;
  pos: number;
  totalMs: number;
  totalPct: number;
  wordMs: number;
  wordPct: number;
  hasWordLimit: boolean;
  me: string;
  players: (Player & { id: string; online: boolean })[];
}>();
const shake = defineModel<boolean>("shake", { default: false });
const max = computed(() => Math.max(1, ...props.players.map((p) => p.score)));
</script>

<template>
  <ProgressBar :percent="totalPct" :danger="totalMs <= 10000" />
  <p class="hint">残り {{ Math.ceil(totalMs / 1000) }} 秒</p>
  <div v-if="hasWordLimit" class="word-timer">
    <ProgressBar :percent="wordPct" :danger="wordPct < 30" />
    <small>{{ (wordMs / 1000).toFixed(1) }}s</small>
  </div>
  <p class="word" :class="{ shake }" @animationend="shake = false">
    <span class="done">{{ word.slice(0, pos) }}</span>{{ word.slice(pos) }}
  </p>
  <ul class="players">
    <li v-for="(p, i) in players" :key="p.id" :class="{ me: p.id === me, off: !p.online }">
      <b>{{ p.id === me ? "あなた" : `P${i + 1}` }}</b>
      <ProgressBar :percent="(p.score / max) * 100" />
      <span>{{ p.score }}pt ・ {{ p.typed }}打 ・ COMBO {{ p.combo }}</span>
    </li>
  </ul>
  <p class="hint">先に正しい数字を打った人のポイント！</p>
</template>
