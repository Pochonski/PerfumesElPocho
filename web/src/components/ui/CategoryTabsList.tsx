import { getVisibleCategoryTabs } from "@/lib/category-tabs";
import CategoryTabs from "@/components/ui/CategoryTabs";

export default function CategoryTabsList() {
  const tabs = getVisibleCategoryTabs();
  return <CategoryTabs tabs={tabs} />;
}
