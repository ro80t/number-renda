<script setup lang="ts">
import type { Player } from "../../battle";

defineProps<{ me: string; ranked: (Player & { id: string; place: number })[] }>();
</script>

<template>
  <ol class="ranking">
    <li v-for="p in ranked" :key="p.id" :class="{ me: p.id === me }">
      <b class="place">{{ p.place }}位</b>
      <span>{{ p.name }}{{ p.id === me ? "（あなた）" : "" }}</span>
      <strong>{{ p.score }}pt</strong>
      <small
        >{{ p.typed }}打 / 完答{{ p.words }} / ミス{{ p.miss }} / 最大COMBO {{ p.maxCombo }}</small
      >
    </li>
  </ol>
</template>
