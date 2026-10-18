<script setup lang="ts">
defineProps<{ label: string }>();
const model = defineModel<boolean>({ required: true });
</script>

<template>
  <label class="toggle">
    <span>{{ label }}</span>
    <input v-model="model" type="checkbox" role="switch" />
    <i aria-hidden="true" />
  </label>
</template>
