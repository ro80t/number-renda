<script setup lang="ts">
import { ref } from "vue";
import AppButton from "../atoms/AppButton.vue";

defineProps<{ closed: boolean }>();
const emit = defineEmits<{ join: [code: string] }>();
const input = ref("");
const create = () => emit("join", String(Math.floor(Math.random() * 1e6)).padStart(6, "0"));
const enter = () => /^\d{6}$/.test(input.value) && emit("join", input.value);
</script>

<template>
  <section class="battle">
    <h2>対戦（最大4人）</h2>
    <div class="actions">
      <AppButton variant="secondary" @click="create">部屋を作る</AppButton>
    </div>
    <p class="hint">または部屋コード（6桁）で入室</p>
    <div class="actions">
      <input v-model="input" inputmode="numeric" maxlength="6" placeholder="000000" @keydown.enter.stop="enter" />
      <AppButton variant="secondary" @click="enter">入室</AppButton>
    </div>
    <p v-if="closed" class="hint">入室できませんでした（満室、または対戦中です）</p>
  </section>
</template>
