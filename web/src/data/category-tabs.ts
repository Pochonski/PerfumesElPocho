export type CategoryIconName =
  | "house"
  | "female"
  | "male"
  | "sparkle"
  | "gift"
  | "drop";

export type CategoryMatchMode = "exact" | "prefix";

export interface CategoryTab {
  label: string;
  href: string;
  icon: CategoryIconName;
  categoryName?: string;
  matchMode: CategoryMatchMode;
}

export const CATEGORY_TABS: CategoryTab[] = [
  {
    label: "Inicio",
    href: "/",
    icon: "house",
    matchMode: "exact",
  },
  {
    label: "Perfumes de Mujer",
    href: "/categoria/perfumes-de-mujer",
    icon: "female",
    categoryName: "Perfumes de mujer",
    matchMode: "prefix",
  },
  {
    label: "Perfumes de Hombre",
    href: "/categoria/perfumes-de-hombre",
    icon: "male",
    categoryName: "Perfumes de hombre",
    matchMode: "prefix",
  },
  {
    label: "Perfumes Árabes/Nicho",
    href: "/categoria/arabes",
    icon: "sparkle",
    categoryName: "\u00c1rabe\u0073",
    matchMode: "prefix",
  },
  {
    label: "Estuches",
    href: "/categoria/estuches",
    icon: "gift",
    categoryName: "Estuches",
    matchMode: "prefix",
  },
  {
    label: "Body Sprays",
    href: "/categoria/body-sprays",
    icon: "drop",
    categoryName: "Body Sprays",
    matchMode: "prefix",
  },
];
