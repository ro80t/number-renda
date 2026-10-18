<script setup lang="ts">
defineProps<{ percent: number; danger?: boolean }>();
</script>

<template>
  <div class="bar" :class="{ danger }"><i :style="{ width: `${Math.max(0, percent)}%` }" /></div>
</template>
