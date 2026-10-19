<script setup lang="ts">
import AppFooter from "../organisms/AppFooter.vue";
import AppHeader from "../organisms/AppHeader.vue";
</script>

<template>
  <div class="page">
    <AppHeader />

    <main>
      <h1>数字連打</h1>
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
