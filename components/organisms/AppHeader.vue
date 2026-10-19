<script setup lang="ts">
import { Link } from "@void/vue";
import { ref } from "vue";
import SettingsDialog from "./SettingsDialog.vue";

const settings = ref<InstanceType<typeof SettingsDialog>>();
</script>

<template>
  <header class="site-header">
    <div class="site-inner">
      <Link href="/" class="brand"
        ><img src="/logo.svg" alt="" width="24" height="24" />数字連打</Link
      >
      <span class="tagline">テンキー・数字タイピング練習</span>
      <button class="icon-btn" aria-label="設定" @click="settings?.open()">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="8" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      </button>
    </div>
  </header>
  <SettingsDialog ref="settings" />
</template>
