<script setup lang="ts">
import AppButton from "../atoms/AppButton.vue";
import StatCard from "../molecules/StatCard.vue";

defineProps<{
  title: string;
  score: number;
  rank: string;
  best: number;
  newRecord: boolean;
  typed: number;
  words: number;
  perSec: string;
  miss: number;
  timeouts: number;
  maxCombo: number;
  accuracy: number;
  suspicious: boolean;
}>();
defineEmits<{ retry: []; back: [] }>();
</script>

<template>
  <h2>結果（{{ title }}）</h2>
  <p v-if="suspicious" class="hint">不自然な入力間隔が検出されたため、この結果は無効です。</p>
  <div class="score-card">
    <div class="rank" :data-rank="rank">{{ rank }}</div>
    <div>
      <div class="score-label">SCORE</div>
      <div class="score-value">{{ score }}</div>
      <div class="score-best">
        <span v-if="newRecord" class="badge">NEW RECORD!</span>
        <span v-else>ベスト {{ best }}</span>
      </div>
    </div>
  </div>
  <div class="stats">
    <StatCard :value="words" label="完答数" />
    <StatCard :value="typed" label="入力文字数" />
    <StatCard :value="perSec" label="文字/秒" />
    <StatCard :value="maxCombo" label="最大コンボ" />
    <StatCard :value="`${accuracy}%`" label="正確率" />
    <StatCard :value="`${miss} / ${timeouts}`" label="ミス / 時間切れ" />
  </div>
  <div class="actions">
    <AppButton @click="$emit('retry')">もう一度</AppButton>
    <AppButton variant="secondary" @click="$emit('back')">難易度選択へ</AppButton>
  </div>
</template>
