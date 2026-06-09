#!/usr/bin/env node
/**
 * Clean & normalize productos.json
 * - Excluye productos con precio 0
 * - Normaliza tamano → "100ML" (uppercase, sin espacios)
 * - Normaliza familia_olfativa → array de strings canónicos
 * - Normaliza ocasion → array de strings trimmed
 * - Deriva genero desde categorias (Mujer/Hombre/Unisex/Niños)
 * - Normaliza marca a Title Case
 *
 * Run: node scripts/clean-data.mjs
 */
import fs from "node:fs";
import path from "node:path";

const INPUT = path.resolve("../scraper/output/productos.json");
const OUTPUT = path.resolve("src/data/productos.cleaned.json");
const REPORT = path.resolve("src/data/clean-report.json");

/* === Normalización de familia olfativa → canónicos === */
const FAMILIA_MAP = {
  amaderada: "Amaderada",
  ambar: "Ámbar",
  amber: "Ámbar",
  aromatica: "Aromática",
  floral: "Floral",
  frutal: "Frutal",
  oriental: "Oriental",
  citrica: "Cítrica",
  especiada: "Especiada",
  gourmand: "Gourmand",
  chipre: "Chipre",
  fougere: "Fougère",
  acuática: "Acuática",
  acuatica: "Acuática",
  marina: "Acuática",
  avainillada: "Vainilla",
  vainilla: "Vainilla",
  almizcle: "Almizcle",
  musk: "Almizcle",
  cuero: "Cuero",
  verde: "Verde",
  herbacea: "Herbácea",
  herbal: "Herbácea",
};

const FAMILIA_CANON = new Set(Object.values(FAMILIA_MAP));

/* === Normalización de ocasión === */
const OCASION_CANON = {
  dia: "Día",
  día: "Día",
  noche: "Noche",
  verano: "Verano",
  invierno: "Invierno",
};

function normalizeFamilia(raw) {
  if (!raw || typeof raw !== "string") return [];
  const parts = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const out = [];
  for (const p of parts) {
    const canon = FAMILIA_MAP[p];
    if (canon && !out.includes(canon)) out.push(canon);
  }
  return out;
}

function normalizeTamano(raw) {
  if (!raw || typeof raw !== "string") return null;
  return raw
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .toUpperCase()
    .trim();
}

function normalizeOcasion(raw) {
  if (!raw || typeof raw !== "string") return [];
  const parts = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const out = [];
  for (const p of parts) {
    const canon = OCASION_CANON[p];
    if (canon && !out.includes(canon)) out.push(canon);
  }
  return out;
}

function deriveGenero(categorias) {
  const out = new Set();
  for (const c of categorias) {
    const lc = c.toLowerCase();
    if (lc.includes("mujer")) out.add("Mujer");
    else if (lc.includes("hombre")) out.add("Hombre");
    else if (lc.includes("unisex")) out.add("Unisex");
    else if (lc.includes("niño") || lc.includes("nino")) out.add("Niños");
  }
  return [...out];
}

function titleCase(s) {
  if (!s) return s;
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* === Run === */
const raw = JSON.parse(fs.readFileSync(INPUT, "utf-8"));
const before = raw.length;

const cleaned = [];
let excludedZero = 0;
let familiaAdded = 0;
let tamanoNormalized = 0;
let ocasionSplit = 0;
let generoDerived = 0;
let marcaTitleCased = 0;

for (const p of raw) {
  if (!p || typeof p !== "object") continue;
  if (!p.precio || p.precio <= 0) {
    excludedZero++;
    continue;
  }

  // Familias
  const familias = normalizeFamilia(p.familia_olfativa);
  if (familias.length > 0) familiaAdded++;

  // Tamaño
  const tamClean = normalizeTamano(p.tamano);
  if (tamClean && tamClean !== p.tamano) tamanoNormalized++;

  // Ocasión
  const ocasionList = normalizeOcasion(p.ocasion);
  if (ocasionList.length > 1) ocasionSplit++;

  // Género derivado
  const generoList = deriveGenero(p.categorias || []);
  if (generoList.length > 0) generoDerived++;

  // Marca Title Case
  const marcaClean = p.marca ? titleCase(p.marca) : "";
  if (marcaClean && marcaClean !== p.marca) marcaTitleCased++;

  cleaned.push({
    ...p,
    url: p.url || `https://essenzaperfumes.cr/producto.php?id=${p.id}`,
    imagenes: (p.imagenes || [])
      .map((img) => (typeof img === "string" ? img : img?.url))
      .filter(Boolean),
    marca: marcaClean,
    tamano: tamClean,
    familias_olfativas: familias,
    ocasiones: ocasionList,
    generos: generoList,
  });
}

/* === Facet counts (post-clean) === */
function countFacet(field) {
  const map = new Map();
  for (const p of cleaned) {
    const v = p[field];
    if (!v) continue;
    map.set(v, (map.get(v) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

const facetStats = {
  total: cleaned.length,
  excluded: { precio_cero: excludedZero },
  applied: {
    familia_normalized: familiaAdded,
    tamano_normalized: tamanoNormalized,
    ocasion_split: ocasionSplit,
    genero_derived: generoDerived,
    marca_titlecased: marcaTitleCased,
  },
  facets: {
    marca_count: countFacet("marca").length,
    concentracion_count: countFacet("concentracion").length,
    tamano_count: countFacet("tamano").length,
    familias_count: countFacet("familias_olfativas").length,
    ocasion_count: countFacet("ocasiones").length,
    genero_count: countFacet("generos").length,
  },
  precio: {
    min: Math.min(...cleaned.map((p) => p.precio)),
    max: Math.max(...cleaned.map((p) => p.precio)),
  },
};

fs.writeFileSync(OUTPUT, JSON.stringify(cleaned, null, 0));
fs.writeFileSync(REPORT, JSON.stringify(facetStats, null, 2));

console.log("=== Clean Report ===");
console.log("Before:", before);
console.log("After :", cleaned.length);
console.log("Excluded (precio=0):", excludedZero);
console.log("--- Applied ---");
console.log("Familia normalized  :", familiaAdded);
console.log("Tamano normalized    :", tamanoNormalized);
console.log("Ocasion split        :", ocasionSplit);
console.log("Genero derived       :", generoDerived);
console.log("Marca title-cased    :", marcaTitleCased);
console.log("--- Facet counts (post) ---");
console.log(facetStats.facets);
console.log("--- Price range ---");
console.log("₡", facetStats.precio.min.toLocaleString("es-CR"), "→ ₡", facetStats.precio.max.toLocaleString("es-CR"));
console.log("Wrote", OUTPUT);
console.log("Report", REPORT);
