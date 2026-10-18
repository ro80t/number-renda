<script setup lang="ts">
import ProgressBar from "../atoms/ProgressBar.vue";
import GameHud from "../molecules/GameHud.vue";

defineProps<{
  title: string;
  word: string;
  pos: number;
  left: number;
  limit: number;
  miss: number;
}>();
const shake = defineModel<boolean>("shake", { default: false });
</script>

<template>
  <ProgressBar :percent="((left - 1) / limit) * 100" />
  <GameHud :title="title" :left="left" :miss="miss" />
  <p class="word" :class="{ shake }" @animationend="shake = false">
    <span class="done">{{ word.slice(0, pos) }}</span>{{ word.slice(pos) }}
  </p>
  <p class="hint">Esc で終了</p>
</template>
