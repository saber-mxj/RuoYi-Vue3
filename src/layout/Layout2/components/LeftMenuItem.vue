<template>
  <div v-if="!item.hidden">
    <template
      v-if="
        hasOneShowingChild(item.children, item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.alwaysShow
      "
    >
      <custom-route-link
        v-if="onlyOneChild.meta"
        :to="resolvePath(onlyOneChild.path, onlyOneChild.query)"
        :class="[
          'left__menu__item',
          {
            'left__menu__item--selected': activeMenu === resolvePath(onlyOneChild.path)
          }
        ]"
        @click="emit('click', resolvePath(onlyOneChild.path))"
      >
        <div>
          <svg-icon
            class-name="menu-icon"
            :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)"
          />
        </div>
        <span class="menu-label" :title="hasTitle(onlyOneChild.meta.title)">
          {{ onlyOneChild.meta.title }}
        </span>
      </custom-route-link>
    </template>
    <template v-else>
      <div>
        <div
          :class="[
            'left__menu__item',
            {
              'left__menu__sub--selected': activeMenu?.startsWith(basePath)
            }
          ]"
          @click="showSubMenu = !showSubMenu"
        >
          <svg-icon class-name="menu-icon" :icon-class="item.meta && item.meta.icon" />
          <span class="menu-label" :title="hasTitle(item.meta.title)">{{ item.meta.title }}</span>
          <span class="left__menu__item__suffix menu-label">
            <icon-font
              :class="[
                'left__menu__item__suffix__icon',
                showSubMenu
                  ? 'left__menu__item__suffix__icon--collapse'
                  : 'left__menu__item__suffix__icon--expand'
              ]"
              name="icon-arrow-down-bold"
            />
          </span>
        </div>
        <el-collapse-transition>
          <div v-show="showSubMenu" :class="['left__menu__sub']">
            <left-menu-item
              v-for="(child, index) in item.children"
              :key="child.path + index"
              :is-nest="true"
              :item="child"
              :base-path="resolvePath(child.path)"
              :active-menu="activeMenu"
              :style="{
                paddingLeft: '20px'
              }"
              @click="emit('click', $event)"
            />
          </div>
        </el-collapse-transition>
      </div>
    </template>
  </div>
</template>

<script setup name="LeftMenuItem">
import { useRouteHandle } from '@/layout/hooks/useRouteHandle.js';
import CustomRouteLink from '@/layout/components/CustomRouteLink.vue';
import IconFont from '@/components/IconFont/index.vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { colorToRgba } from '@/utils/theme.js';
import { useCssVar } from '@vueuse/core';

const props = defineProps({
  // route object
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  },
  activeMenu: String
});
const emit = defineEmits(['click']);

const { onlyOneChild, hasOneShowingChild, hasTitle, resolvePath } = useRouteHandle({
  basePath: props.basePath
});

const route = useRoute();

const showSubMenu = ref(false);
const leftMenuSubRef = ref(null);

const primaryColor = useCssVar('--el-color-primary');
const selectedBgColorStart = computed(() => colorToRgba(primaryColor.value, 0.2));
const selectedBgColorEnd = computed(() => colorToRgba(primaryColor.value, 0.1));
</script>

<style lang="scss" scoped>
.left__menu__item {
  display: flex;
  gap: 12px;
  align-items: center;
  line-height: 40px;
  height: 40px;
  color: var(--menu-text-color);
  cursor: pointer;
  user-select: none;
  padding-left: 12px;
  padding-right: 12px;
  overflow: hidden;
  &:hover {
    color: var(--el-color-primary);
    .menu-icon,
    .menu-label {
      color: var(--el-color-primary);
    }
  }
  &__suffix {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    &:deep(.el-icon) {
    }
    &__icon {
      transition: transform 0.5s ease;
      transform-origin: center;
      font-size: 14px;
    }
    &__icon--collapse {
      transform: rotate(180deg);
    }
    &__icon--expand {
      transform: rotate(0deg);
    }
  }
}
.left__menu__item--selected {
  position: relative;
  background: linear-gradient(
    to right,
    v-bind(selectedBgColorStart) 0%,
    v-bind(selectedBgColorEnd) 100%
  );
  border-radius: var(--el-border-radius-base);
  animation: menuItemSelectedAnimation 0.2s ease-in-out;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 2px;
    height: 100%;
    background-color: var(--el-color-primary);
    border-radius: var(--el-border-radius-base);
  }
  @keyframes menuItemSelectedAnimation {
    0% {
      width: 20px;
    }
    100% {
      width: 100%;
    }
  }
  .menu-icon {
    color: var(--el-color-primary);
  }
  .menu-label {
    font-weight: 500;
    font-family: var(--bc-font-family-medium);
    color: rgba(31, 45, 61, 1) !important;
  }
}
.left__menu__sub {
  padding-top: 12px;
  padding-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}
.left__menu__sub--selected {
  position: relative;
  background: linear-gradient(
    to right,
    v-bind(selectedBgColorEnd) 0%,
    v-bind(selectedBgColorStart) 50%,
    v-bind(selectedBgColorEnd) 100%
  );
  border-radius: var(--el-border-radius-base);
  .menu-icon {
    color: var(--el-color-primary);
  }
  .menu-label {
    font-weight: 500;
    font-family: var(--bc-font-family-medium);
    color: rgba(31, 45, 61, 1) !important;
  }
}
.menu-icon {
  color: #475669;
  font-size: 16px;
}
.menu-label {
  color: rgba(71, 86, 105, 1);
  font-weight: 400;
  white-space: nowrap;
}
</style>
