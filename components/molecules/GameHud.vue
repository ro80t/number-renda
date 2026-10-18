<script setup lang="ts">
defineProps<{ title: string; left: number; miss: number }>();
</script>

<template>
  <div class="hud">
    <span>{{ title }}</span>
    <span>残り {{ left }} 秒</span>
    <span>ミス <span class="miss">{{ miss }}</span></span>
  </div>
</template>
