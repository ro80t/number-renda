<script setup lang="ts">
import { ref } from "vue";
import AppButton from "../atoms/AppButton.vue";

defineProps<{ room: string; players: number; error: boolean }>();
const emit = defineEmits<{ join: [code: string]; leave: [] }>();
const input = ref("");
const create = () => emit("join", String(Math.floor(Math.random() * 1e6)).padStart(6, "0"));
const enter = () => /^\d{6}$/.test(input.value) && emit("join", input.value);
</script>

<template>
  <section class="battle">
    <template v-if="!room">
      <h2>対戦</h2>
      <div class="actions">
        <AppButton variant="secondary" @click="create">部屋を作る</AppButton>
      </div>
      <p class="hint">または部屋コード（6桁）で入室</p>
      <div class="actions">
        <input v-model="input" inputmode="numeric" maxlength="6" placeholder="000000" @keydown.enter.stop="enter" />
        <AppButton variant="secondary" @click="enter">入室</AppButton>
      </div>
    </template>
    <template v-else>
      <h2>部屋コード: {{ room }}</h2>
      <p class="hint" v-if="error">満室です</p>
      <p class="hint" v-else>{{ players >= 2 ? "対戦相手が揃いました。スタートで開始！" : "相手の入室を待っています…（コードを共有）" }}</p>
      <AppButton variant="secondary" @click="emit('leave')">退室</AppButton>
    </template>
  </section>
</template>
