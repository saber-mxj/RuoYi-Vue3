<template>
  <component :is="currentLayoutComponent" />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings.js';

const settingsStore = useSettingsStore();

const currentLayoutComponent = computed(() => {
  return defineAsyncComponent(() => import(`@/layout/${settingsStore.layoutType}/index.vue`));
});
</script>
