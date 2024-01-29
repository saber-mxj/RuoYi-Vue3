<template>
  <div class="layout2">
    <section class="layout2__left">
      <div class="layout2__left__header">
        <span class="layout2__left__header__logo"><img src="@/assets/logo/logo.png" alt="" /></span>
        <span class="layout2__left__header__title">{{ title }}</span>
      </div>
      <div class="layout2__left__menu"><left-menu /></div>
    </section>
    <section class="layout2__right">
      <section class="layout2__right__header"></section>
      <section class="layout2__right__crumb"></section>
      <section class="layout2__right__content">
        <el-scrollbar style="height: 100%">
          <app-main />
        </el-scrollbar>
      </section>
    </section>
  </div>
</template>

<script setup name="Layout2">
import { useCssVar } from '@vueuse/core';
import { colorToRgba } from '@/utils/theme.js';
import LeftMenu from '@/layout/Layout2/components/LeftMenu.vue';
import { AppMain } from '@/layout/Layout1/components/index.js';

const title = import.meta.env.VITE_APP_TITLE;

const primaryColor = useCssVar('--el-color-primary');
const bgStartColor = computed(() => colorToRgba(primaryColor.value, 0.1));
const bgEndColor = computed(() => colorToRgba(primaryColor.value, 0.06));
</script>

<style lang="scss" scoped>
.layout2 {
  --slider-bar-width: 280px;
  --logo-size: 24px;
  --menu-text-color: rgba(71, 86, 105, 1);
  --left-bg: url(@/assets/images/side-menu-bg.png) no-repeat center / 100% 100%;
  --right-bg: url(@/assets/images/side-menu-bg.png) no-repeat center / 100% 100%;

  font-family: var(--el-font-family);
  font-weight: 400;
  display: flex;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, v-bind(bgStartColor) 0%, v-bind(bgEndColor) 100%);
  //background-color: rgba(246, 249, 250, 1);
  //background-image: url(@/assets/images/layout2-background.png);
  //padding: 16px;
  //gap: 20px;
  &__left {
    display: flex;
    flex-direction: column;
    width: var(--slider-bar-width);
    gap: 32px;
    background: var(--left-bg);
    padding: 16px 0 16px 16px;
    &__header {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 0 0 0 8px;
      &__logo {
        width: var(--logo-size);
        height: var(--logo-size);
        > img {
          width: 100%;
          height: 100%;
        }
      }
      &__title {
        font-family: var(--bc-font-family-medium);
        font-size: 20px;
        font-weight: 500;
      }
    }
    &__menu {
      flex: 1;
      overflow: hidden;
    }
  }
  &__right {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px 16px 12px 0;
    background: var(--left-bg);
    &__content {
      flex: 1;
      overflow: hidden;
      background-color: #fff;
      border-radius: var(--el-border-radius-base);
    }
  }
}
</style>
