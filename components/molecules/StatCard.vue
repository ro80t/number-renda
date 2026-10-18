<script setup lang="ts">
defineProps<{ value: string | number; label: string }>();
</script>

<template>
  <div class="stat"><b>{{ value }}</b><span>{{ label }}</span></div>
</template>
