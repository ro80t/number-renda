<script setup lang="ts">
import { CUSTOM_LIMIT } from "../../game";
import NumberField from "../atoms/NumberField.vue";

const min = defineModel<number>("min", { required: true });
const max = defineModel<number>("max", { required: true });
</script>

<template>
  <div class="custom">
    <NumberField v-model="min" :min="CUSTOM_LIMIT.min" :max="CUSTOM_LIMIT.max" />
    〜
    <NumberField v-model="max" :min="CUSTOM_LIMIT.min" :max="CUSTOM_LIMIT.max" />
    桁
  </div>
</template>
