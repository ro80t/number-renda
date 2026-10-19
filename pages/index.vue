<script setup lang="ts">
import { computed } from "vue";
import "../styles.css";
import BattlePanel from "../components/organisms/BattlePanel.vue";
import AppButton from "../components/atoms/AppButton.vue";
import GameSettings from "../components/organisms/GameSettings.vue";
import LevelSelector from "../components/organisms/LevelSelector.vue";
import ResultPanel from "../components/organisms/ResultPanel.vue";
import TypingBoard from "../components/organisms/TypingBoard.vue";
import GameLayout from "../components/templates/GameLayout.vue";
import SegmentedControl from "../components/molecules/SegmentedControl.vue";
import BattleBoard from "../components/organisms/BattleBoard.vue";
import RankingList from "../components/organisms/RankingList.vue";
import { useBattle } from "../composables/useBattle";
import { useTypingGame } from "../composables/useTypingGame";

const SCORING = [
  { value: 0, label: "総取り" },
  { value: 1, label: "都度加算" },
];
const b = useBattle();
const g = useTypingGame(computed(() => b.room.value !== ""));
const canStart = computed(() => b.players.value.length >= 2);
</script>

<template>
  <GameLayout>
    <template v-if="b.room.value">
      <h2>部屋コード: {{ b.room.value }}</h2>

      <template v-if="b.phase.value === 'lobby'">
        <p class="hint">
          {{
            canStart
              ? `${b.players.value.length}人が揃いました。スタートで開始！`
              : "相手の入室を待っています…（コードを共有）"
          }}
        </p>
        <section class="mode">
          <h2>参加者</h2>
          <label class="field"
            >表示名<input
              v-model="b.name.value"
              class="name"
              maxlength="12"
              placeholder="未入力なら P1, P2…"
          /></label>
          <ul class="players">
            <li v-for="p in b.players.value" :key="p.id" :class="{ me: p.id === b.me.value }">
              <b>{{ p.name }}{{ p.id === b.me.value ? "（あなた）" : "" }}</b>
            </li>
          </ul>
        </section>
        <section class="mode">
          <h2>ルール</h2>
          <LevelSelector
            v-model:level="g.level.value"
            v-model:custom-min="g.customMin.value"
            v-model:custom-max="g.customMax.value"
          />
          <GameSettings v-model:total="g.total.value" v-model:word-limit="g.wordLimit.value" />
          <SegmentedControl v-model="b.live.value" label="得点方式" :options="SCORING" />
          <p class="hint">
            {{
              b.live.value
                ? "打った数字ごとに加点。先に打ち終えるとボーナス"
                : "先に打ち終えた人が、全員のその単語のポイントを総取り"
            }}
          </p>
        </section>
        <div class="actions">
          <AppButton :disabled="!canStart" @click="b.start(g.config())">スタート</AppButton>
          <AppButton variant="secondary" @click="b.leave">退室</AppButton>
        </div>
      </template>

      <BattleBoard
        v-else-if="b.phase.value === 'play'"
        v-model:shake="b.shake.value"
        :word="b.snap.value!.word"
        :pos="b.mine.value?.pos ?? 0"
        :total-ms="b.totalMs.value"
        :total-pct="(b.totalMs.value / (b.snap.value!.cfg.total * 1000)) * 100"
        :word-ms="b.wordMs.value"
        :word-pct="(b.wordMs.value / (b.snap.value!.cfg.wordLimit * 1000)) * 100"
        :has-word-limit="b.hasWordLimit.value"
        :me="b.me.value"
        :players="b.players.value"
      />

      <template v-else>
        <h2>結果</h2>
        <RankingList :me="b.me.value" :ranked="b.ranked.value" />
        <div class="actions">
          <AppButton :disabled="!canStart" @click="b.start(g.config())">もう一度</AppButton>
          <AppButton variant="secondary" @click="b.leave">退室</AppButton>
        </div>
      </template>
    </template>

    <template v-else-if="g.phase.value === 'idle'">
      <p class="sub">表示された数字を上段キー / テンキーで入力（{{ g.total.value }}秒）</p>
      <section class="mode">
        <h2>ひとりで遊ぶ</h2>
        <LevelSelector
          v-model:level="g.level.value"
          v-model:custom-min="g.customMin.value"
          v-model:custom-max="g.customMax.value"
        />
        <GameSettings v-model:total="g.total.value" v-model:word-limit="g.wordLimit.value" />
        <AppButton @click="g.start">スタート</AppButton>
        <p class="hint">Space / Enter でも開始</p>
      </section>
      <BattlePanel v-model:name="b.name.value" :closed="b.closed.value" @join="b.join" />
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
      @retry="g.start"
      @back="g.phase.value = 'idle'"
    />
  </GameLayout>
</template>
