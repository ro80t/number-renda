<script setup lang="ts">
import ProgressBar from "../atoms/ProgressBar.vue";
import GameHud from "../molecules/GameHud.vue";

defineProps<{
  title: string;
  word: string;
  pos: number;
  left: number;
  totalPct: number;
  wordPct: number;
  wordLeft: string;
  hasWordLimit: boolean;
  score: number;
  combo: number;
  miss: number;
}>();
const shake = defineModel<boolean>("shake", { default: false });
</script>

<template>
  <ProgressBar :percent="totalPct" :danger="left <= 10" />
  <GameHud :title="title" :left="left" :score="score" :combo="combo" :miss="miss" />
  <div v-if="hasWordLimit" class="word-timer">
    <ProgressBar :percent="wordPct" :danger="wordPct < 30" />
    <small>{{ wordLeft }}s</small>
  </div>
  <p class="word" :class="{ shake }" @animationend="shake = false">
    <span class="done">{{ word.slice(0, pos) }}</span
    >{{ word.slice(pos) }}
  </p>
  <p class="hint">Esc で終了</p>
</template>
