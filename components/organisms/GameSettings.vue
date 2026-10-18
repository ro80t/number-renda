<script setup lang="ts">
import { TOTAL_OPTIONS, WORD_OPTIONS } from "../../game";
import SegmentedControl from "../molecules/SegmentedControl.vue";

const total = defineModel<number>("total", { required: true });
const wordLimit = defineModel<number>("wordLimit", { required: true });

const totalOptions = TOTAL_OPTIONS.map((v) => ({ value: v, label: `${v}秒` }));
const wordOptions = WORD_OPTIONS.map((v) => ({ value: v, label: v ? `${v}秒` : "なし" }));
</script>

<template>
  <div class="game-settings">
    <SegmentedControl v-model="total" label="制限時間" :options="totalOptions" />
    <SegmentedControl v-model="wordLimit" label="1問の制限" :options="wordOptions" />
  </div>
</template>
