<script setup lang="ts">
defineProps<{ label: string; options: { value: number; label: string }[] }>();
const model = defineModel<number>({ required: true });
</script>

<template>
  <div class="seg-row">
    <span class="seg-label">{{ label }}</span>
    <div class="seg" role="group" :aria-label="label">
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        :aria-pressed="model === o.value"
        @click="model = o.value"
      >
        {{ o.label }}
      </button>
    </div>
  </div>
</template>
