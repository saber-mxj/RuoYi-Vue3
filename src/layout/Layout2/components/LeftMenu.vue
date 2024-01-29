<template>
  <el-scrollbar style="height: 100%">
    <div class="left__menu">
      <left-menu-item
        v-for="(route, index) in sidebarRouters"
        :key="route.path + index"
        :item="route"
        :base-path="route.path"
        :active-menu="activeMenu"
        @click="handleSelect"
      />
    </div>
  </el-scrollbar>
</template>

<script setup name="LeftMenu">
import usePermissionStore from '@/store/modules/permission.js';
import LeftMenuItem from '@/layout/Layout2/components/LeftMenuItem.vue';
import { useRoute } from 'vue-router';

const permissionStore = usePermissionStore();
const route = useRoute();
const sidebarRouters = computed(() => {
  console.log(
    permissionStore.sidebarRouters.filter((item) => !item.hidden),
    'permissionStore.sidebarRouters.filter((item) => !item.hidden)'
  );
  return permissionStore.sidebarRouters.filter((item) => !item.hidden);
});

const activeMenu = ref();
function handleSelect(value) {
  activeMenu.value = value;
}

watchEffect(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    activeMenu.value = meta.activeMenu;
  }
  activeMenu.value = path;
});
</script>

<style lang="scss" scoped>
.left__menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 12px 0 8px;
}
</style>
