import { isExternal } from '@/utils/validate.js';
import { getNormalPath } from '@/utils/ruoyi.js';

export function useRouteHandle({ basePath }) {
  const onlyOneChild = ref({});

  function hasOneShowingChild(children = [], parent) {
    if (!children) {
      children = [];
    }
    const showingChildren = children.filter((item) => {
      if (item.hidden) {
        return false;
      } else {
        // Temp set(will be used if only has one showing child)
        onlyOneChild.value = item;
        return true;
      }
    });

    // When there is only one child router, the child router is displayed by default
    if (showingChildren.length === 1) {
      return true;
    }

    // Show parent if there are no child router to display
    if (showingChildren.length === 0) {
      onlyOneChild.value = { ...parent, path: '', noShowingChildren: true };
      return true;
    }

    return false;
  }

  function resolvePath(routePath, routeQuery = null) {
    if (isExternal(routePath)) {
      return routePath;
    }
    if (isExternal(basePath)) {
      return basePath;
    }
    if (routeQuery) {
      let query = JSON.parse(routeQuery);
      return { path: getNormalPath(basePath + '/' + routePath), query: query };
    }
    return getNormalPath(basePath + '/' + routePath);
  }

  function hasTitle(title) {
    if (title.length > 5) {
      return title;
    } else {
      return '';
    }
  }

  return {
    onlyOneChild,
    hasOneShowingChild,
    resolvePath,
    hasTitle
  };
}
