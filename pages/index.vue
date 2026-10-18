<script setup lang="ts">
import "../styles.css";
import AppButton from "../components/atoms/AppButton.vue";
import LevelSelector from "../components/organisms/LevelSelector.vue";
import ResultPanel from "../components/organisms/ResultPanel.vue";
import TypingBoard from "../components/organisms/TypingBoard.vue";
import GameLayout from "../components/templates/GameLayout.vue";
import { LIMIT, useTypingGame } from "../composables/useTypingGame";

const g = useTypingGame();
</script>

<template>
  <GameLayout>
    <template v-if="g.phase.value === 'idle'">
      <p class="sub">表示された数字を上段キー / テンキーで入力（{{ LIMIT }}秒）</p>
      <LevelSelector v-model:level="g.level.value" v-model:custom-min="g.customMin.value" v-model:custom-max="g.customMax.value" />
      <AppButton @click="g.start">スタート</AppButton>
      <p class="hint">Space / Enter でも開始</p>
    </template>

    <TypingBoard
      v-else-if="g.phase.value === 'play'"
      v-model:shake="g.shake.value"
      :title="g.title.value"
      :word="g.word.value"
      :pos="g.pos.value"
      :left="g.left.value"
      :limit="LIMIT"
      :miss="g.miss.value"
    />

    <ResultPanel
      v-else
      :title="g.title.value"
      :typed="g.typed.value"
      :words="g.words.value"
      :per-sec="g.perSec.value"
      :miss="g.miss.value"
      :accuracy="g.accuracy.value"
      :suspicious="g.suspicious.value"
      @retry="g.start"
      @back="g.phase.value = 'idle'"
    />
  </GameLayout>
</template>
