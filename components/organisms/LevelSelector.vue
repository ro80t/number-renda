<script setup lang="ts">
import { LEVELS, type Level } from "../../game";
import LevelCard from "../molecules/LevelCard.vue";
import RangeInput from "../molecules/RangeInput.vue";

const level = defineModel<Level>("level", { required: true });
const customMin = defineModel<number>("customMin", { required: true });
const customMax = defineModel<number>("customMax", { required: true });
</script>

<template>
  <div class="levels">
    <LevelCard
      v-for="(l, key) in LEVELS"
      :key="key"
      :label="l.label"
      :sub="`${l.min}〜${l.max}桁`"
      :selected="level === key"
      @click="level = key"
    />

    <LevelCard
      label="カスタム"
      sub="桁数を指定"
      :selected="level === 'custom'"
      @click="level = 'custom'"
    />
  </div>

  <RangeInput v-if="level === 'custom'" v-model:min="customMin" v-model:max="customMax" />
</template>
