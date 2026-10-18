<script setup lang="ts">
defineProps<{ min?: number; max?: number }>();
const model = defineModel<number>({ required: true });
</script>

<template>
  <input v-model.number="model" class="number-field" type="number" :min="min" :max="max" />
</template>
