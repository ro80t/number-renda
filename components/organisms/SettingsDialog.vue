<script setup lang="ts">
import { ref } from "vue";
import { useSoundSettings } from "../../composables/useSound";
import ToggleSwitch from "../atoms/ToggleSwitch.vue";

const { enabled, volume, preview } = useSoundSettings();
const dlg = ref<HTMLDialogElement>();
defineExpose({ open: () => dlg.value?.showModal() });
</script>

<template>
  <dialog ref="dlg" class="settings" @click="$event.target === dlg && dlg?.close()">
    <form method="dialog">
      <header>
        <h2>設定</h2>
        <button class="icon-btn" aria-label="閉じる">✕</button>
      </header>
      <ToggleSwitch v-model="enabled" label="効果音" />
      <label class="slider" :class="{ off: !enabled }">
        <span>音量</span>
        <input v-model.number="volume" type="range" min="0" max="1" step="0.05" :disabled="!enabled" @change="preview" />
      </label>
    </form>
  </dialog>
</template>
