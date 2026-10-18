<script setup lang="ts">
defineProps<{ variant?: "primary" | "secondary" }>();
</script>

<template>
  <button class="btn" :class="variant === 'secondary' && 'secondary'"><slot /></button>
</template>
