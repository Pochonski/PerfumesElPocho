import type { ComponentType } from "react";
import {
  House,
  GenderFemale,
  GenderMale,
  Sparkle,
  Gift,
  Drop,
} from "@phosphor-icons/react";

export interface CategoryTab {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; weight?: "duotone" | "regular" | "fill"; className?: string }>;
  categoryName?: string;
  match: (pathname: string) => boolean;
}

export const CATEGORY_TABS: CategoryTab[] = [
  {
    label: "Inicio",
    href: "/",
    icon: House,
    match: (pathname) => pathname === "/",
  },
  {
    label: "Perfumes de Mujer",
    href: "/categoria/perfumes-de-mujer",
    icon: GenderFemale,
    categoryName: "Perfumes de mujer",
    match: (pathname) => pathname === "/categoria/perfumes-de-mujer",
  },
  {
    label: "Perfumes de Hombre",
    href: "/categoria/perfumes-de-hombre",
    icon: GenderMale,
    categoryName: "Perfumes de hombre",
    match: (pathname) => pathname === "/categoria/perfumes-de-hombre",
  },
  {
    label: "Perfumes Árabes/Nicho",
    href: "/categoria/perfumes-arabes-nicho",
    icon: Sparkle,
    match: (pathname) => pathname === "/categoria/perfumes-arabes-nicho",
  },
  {
    label: "Estuches",
    href: "/categoria/estuches",
    icon: Gift,
    match: (pathname) => pathname === "/categoria/estuches",
  },
  {
    label: "Body Sprays",
    href: "/categoria/body-sprays",
    icon: Drop,
    match: (pathname) => pathname === "/categoria/body-sprays",
  },
];
