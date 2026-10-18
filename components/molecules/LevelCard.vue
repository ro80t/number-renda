<script setup lang="ts">
defineProps<{ label: string; sub: string; selected: boolean }>();
</script>

<template>
  <button class="level" :aria-pressed="selected">
    <b>{{ label }}</b><span>{{ sub }}</span>
  </button>
</template>
