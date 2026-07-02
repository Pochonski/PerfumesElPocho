import { getProductosByCategoria } from "./productos";
import { CATEGORY_TABS, type CategoryTab } from "@/data/category-tabs";

export function getVisibleCategoryTabs(): CategoryTab[] {
  return CATEGORY_TABS.filter((tab) => {
    if (tab.forceVisible) return true;
    if (!tab.categoryName) return true;
    return getProductosByCategoria(tab.categoryName).length > 0;
  });
}
