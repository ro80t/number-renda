<script setup lang="ts">
import "../styles.css";
import BattlePanel from "../components/organisms/BattlePanel.vue";
import AppButton from "../components/atoms/AppButton.vue";
import GameSettings from "../components/organisms/GameSettings.vue";
import LevelSelector from "../components/organisms/LevelSelector.vue";
import ResultPanel from "../components/organisms/ResultPanel.vue";
import TypingBoard from "../components/organisms/TypingBoard.vue";
import GameLayout from "../components/templates/GameLayout.vue";
import { useTypingGame } from "../composables/useTypingGame";

const g = useTypingGame();
</script>

<template>
  <GameLayout>
    <template v-if="g.phase.value === 'idle'">
      <p class="sub">表示された数字を上段キー / テンキーで入力（{{ g.total.value }}秒）</p>
      <LevelSelector v-model:level="g.level.value" v-model:custom-min="g.customMin.value" v-model:custom-max="g.customMax.value" />
      <GameSettings v-model:total="g.total.value" v-model:word-limit="g.wordLimit.value" />
      <BattlePanel :room="g.room.value" :players="g.players.value" :error="g.roomError.value" @join="g.join" @leave="g.leave" />
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
      :total-pct="g.totalPct.value"
      :word-pct="g.wordPct.value"
      :word-left="g.wordLeft.value"
      :has-word-limit="g.wordLimit.value > 0"
      :score="g.score.value"
      :combo="g.combo.value"
      :miss="g.miss.value"
      :opp-score="g.room.value ? g.oppScore.value : undefined"
    />

    <ResultPanel
      v-else
      :title="g.title.value"
      :score="g.score.value"
      :rank="g.rank.value"
      :best="g.best.value"
      :new-record="g.newRecord.value"
      :typed="g.typed.value"
      :words="g.words.value"
      :per-sec="g.perSec.value"
      :miss="g.miss.value"
      :timeouts="g.timeouts.value"
      :max-combo="g.maxCombo.value"
      :accuracy="g.accuracy.value"
      :suspicious="g.suspicious.value"
      :opp-score="g.room.value ? g.oppScore.value : undefined"
      :opp-done="g.oppDone.value"
      @retry="g.start"
      @back="g.phase.value = 'idle'"
    />
  </GameLayout>
</template>
