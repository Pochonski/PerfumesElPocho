import type { ComponentType } from "react";
import {
  House,
  GenderFemale,
  GenderMale,
  GenderIntersex,
  Baby,
  Sparkle,
  Gift,
  Drop,
} from "@phosphor-icons/react";

export type CategoryIconName =
  | "house"
  | "female"
  | "male"
  | "intersex"
  | "baby"
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
  forceVisible?: boolean;
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
    label: "Perfumes Unisex",
    href: "/categoria/perfumes-unisex",
    icon: "intersex",
    categoryName: "Perfumes unisex",
    matchMode: "prefix",
  },
  {
    label: "Perfumes Árabes/Nicho",
    href: "/categoria/arabes",
    icon: "sparkle",
    categoryName: "Árabes",
    matchMode: "prefix",
  },
  {
    label: "Niños",
    href: "/categoria/ninos",
    icon: "baby",
    categoryName: "Niños",
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
    forceVisible: true,
  },
];
