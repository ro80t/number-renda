<script setup lang="ts">
import ProgressBar from "../atoms/ProgressBar.vue";
import type { Player } from "../../battle";

defineProps<{
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
    <li v-for="p in players" :key="p.id" :class="{ me: p.id === me, off: !p.online }">
      <b>{{ p.name }}{{ p.id === me ? "（あなた）" : "" }} <em>{{ p.score }}pt</em></b>
      <ProgressBar :percent="(p.pos / word.length) * 100" />
      <span>{{ p.pos }} / {{ word.length }}桁 ・ {{ p.typed }}打 ・ COMBO {{ p.combo }}</span>
    </li>
  </ul>
  <p class="hint">先に打ち終えた人が有利！</p>
</template>
