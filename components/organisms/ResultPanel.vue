<script setup lang="ts">
import AppButton from "../atoms/AppButton.vue";
import StatCard from "../molecules/StatCard.vue";

defineProps<{
  title: string;
  typed: number;
  words: number;
  perSec: string;
  miss: number;
  accuracy: number;
  suspicious: boolean;
}>();
defineEmits<{ retry: []; back: [] }>();
</script>

<template>
  <h2>結果（{{ title }}）</h2>
  <p v-if="suspicious" class="hint">不自然な入力間隔が検出されたため、この結果は無効です。</p>
  <div class="stats">
    <StatCard :value="typed" label="入力文字数" />
    <StatCard :value="words" label="完答数" />
    <StatCard :value="perSec" label="文字/秒" />
    <StatCard :value="miss" label="ミス" />
    <StatCard :value="`${accuracy}%`" label="正確率" />
  </div>
  <div class="actions">
    <AppButton @click="$emit('retry')">もう一度</AppButton>
    <AppButton variant="secondary" @click="$emit('back')">難易度選択へ</AppButton>
  </div>
</template>
