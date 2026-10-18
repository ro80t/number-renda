<script setup lang="ts">
defineProps<{ percent: number }>();
</script>

<template>
  <div class="bar"><i :style="{ width: `${percent}%` }" /></div>
</template>
