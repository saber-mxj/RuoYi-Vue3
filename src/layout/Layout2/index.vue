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
      <section class="layout2__right__header">
        <breadcrumb
          id="breadcrumb-container"
          class="breadcrumb-container"
          :style="{
            lineHeight: 'unset'
          }"
        />
        <div class="layout2__right__header__right">
          <screen-full class="layout2__right__header__right__item" id="screenfull" />
          <div class="layout2__right__header__right__user layout2__right__header__right__item">
            <el-dropdown @command="handleCommand" class="" trigger="click">
              <el-space class="layout2__right__header__right__user__name">
                <span>{{ userStore.name }}</span>
                <el-icon><caret-bottom /></el-icon>
              </el-space>
              <template #dropdown>
                <el-dropdown-menu>
                  <router-link to="/user/profile">
                    <el-dropdown-item>个人中心</el-dropdown-item>
                  </router-link>
                  <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
                    <span>布局设置</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <span>退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </section>
      <section class="layout2__right__tags"></section>

      <section class="layout2__right__content">
        <app-main style="height: 100%" />
      </section>
    </section>

    <settings ref="settingRef" />
  </div>
</template>

<script setup name="Layout2">
import { useCssVar } from '@vueuse/core';
import { colorToRgba } from '@/utils/theme.js';
import LeftMenu from '@/layout/Layout2/components/LeftMenu.vue';
import { AppMain, Settings } from '@/layout/Layout1/components/index.js';
import Breadcrumb from '@/components/Breadcrumb';
import ScreenFull from '@/components/Screenfull/index.vue';
import useSettingsStore from '@/store/modules/settings.js';
import useUserStore from '@/store/modules/user.js';
import { ElMessageBox } from 'element-plus';

const settingsStore = useSettingsStore();
const userStore = useUserStore();
const title = import.meta.env.VITE_APP_TITLE;

const primaryColor = useCssVar('--el-color-primary');
const bgStartColor = computed(() => colorToRgba(primaryColor.value, 0.12));
const bgEndColor = computed(() => colorToRgba(primaryColor.value, 0.0));

function handleCommand(command) {
  switch (command) {
    case 'setLayout':
      setLayout();
      break;
    case 'logout':
      logout();
      break;
    default:
      break;
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      userStore.logOut().then(() => {
        location.href = '/index';
      });
    })
    .catch(() => {});
}

const settingRef = ref(null);
function setLayout() {
  settingRef.value.openSetting();
}
</script>

<style lang="scss" scoped>
.layout2 {
  --slider-bar-width: 280px;
  --logo-size: 24px;
  --menu-text-color: rgba(71, 86, 105, 1);
  --left-bg: url(@/assets/images/side-menu-bg.png) no-repeat center / 100% 100%;
  --right-bg: url(@/assets/images/side-menu-bg.png) no-repeat center / 100% 100%;
  --header-height: 28px;

  font-family: var(--el-font-family);
  font-weight: 400;
  display: flex;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right bottom, v-bind(bgStartColor) 0%, v-bind(bgEndColor) 100%);
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
      height: var(--header-height);
      line-height: var(--header-height);
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
    padding: 16px 16px 12px 0;
    background: var(--left-bg);
    gap: 8px;
    &__header {
      display: flex;
      align-items: center;
      height: var(--header-height);
      line-height: var(--header-height);
      &__right {
        flex: 1;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 20px;
        &__item {
          cursor: pointer;
          color: var(--menu-text-color);
        }
        &__user {
          display: flex;
          align-items: center;
          &__name {
            font-size: 16px;
            color: var(--el-color-primary);
          }
        }
      }
    }
    &__content {
      flex: 1;
      overflow: hidden;
      background-color: #fff;
      border-radius: var(--el-border-radius-base);
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }
}
</style>
