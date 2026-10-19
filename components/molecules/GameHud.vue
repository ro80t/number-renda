<script setup lang="ts">
defineProps<{ title: string; left: number; score: number; combo: number; miss: number }>();
</script>

<template>
  <div class="hud">
    <div class="hud-title">{{ title }}</div>

    <div class="hud-cells">
      <div class="hud-cell">
        <span>残り</span><b>{{ left }}<small>秒</small></b>
      </div>

      <div class="hud-cell score">
        <span>SCORE</span><b>{{ score }}</b>
      </div>

      <div class="hud-cell">
        <span>COMBO</span><b>{{ combo }}</b>
      </div>

      <div class="hud-cell">
        <span>ミス</span><b class="miss">{{ miss }}</b>
      </div>
    </div>
  </div>
</template>
