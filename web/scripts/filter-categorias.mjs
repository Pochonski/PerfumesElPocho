#!/usr/bin/env node
/**
 * Filter invalid categorias from productos.json (conservative)
 * - Removes invalid cats (sizes, occasions, fragrance families)
 * - Keeps products even if all cats are invalid (preserves their data)
 * - Adds derived cats from genero string if no valid cat remains
 */
import fs from "node:fs";
import path from "node:path";

const INPUT = path.resolve("src/data/productos.json");
const REPORT = path.resolve("src/data/clean-categorias-report.json");

const data = JSON.parse(fs.readFileSync(INPUT, "utf-8"));

const GENERO_TO_CAT = {
  "Mujer": "Perfumes de mujer",
  "Hombre": "Perfumes de hombre",
  "Unisex": "Perfumes unisex",
  "Niños": "Niños",
  "Niño": "Niños",
  "Niña": "Niños",
};

function isValidCategoria(text) {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  if (!lower) return false;
  if (/\d+\s*[mM][lL]/.test(text)) return false;
  if (/^\d+(\.\d+)?\s*[mM][lL]$/.test(text)) return false;
  if (["día", "dia", "noche", "verano", "invierno"].some((w) => new RegExp(`\\b${w}\\b`).test(lower))) return false;
  const familyWords = [
    "amaderad", "aromatic", "floral", "oriental", "cítric", "citric",
    "frutal", "especiad", "acuátic", "acquatic", "gourmand", "fougere",
    "avainillad", "ámbar", "ambar", "amber", "chypre", "cuero",
    "almizcle", "musk", "chipre", "verde", "herbácea", "herbal",
    "vainilla", "marina", "afrutad", "dulce", "acuátic",
  ];
  if (familyWords.some((w) => lower.includes(w))) return false;
  if (/^\d+\s*p[zs]s?$/i.test(lower)) return false;
  if (/^\d+\s*piezas?$/i.test(lower)) return false;
  if (["inicio", "home", "tienda", "todos"].includes(lower)) return false;
  return true;
}

function deriveCatsFromGenero(generoStr, nombre = "") {
  if (!generoStr) return [];
  const cats = new Set();
  const lowerNombre = nombre.toLowerCase();
  for (const [genKey, catLabel] of Object.entries(GENERO_TO_CAT)) {
    const re = new RegExp(`\\b${genKey}\\b`, "i");
    if (!re.test(generoStr)) continue;
    // For "Niños" only assign if the product name actually suggests kids
    if (genKey === "Niños" || genKey === "Niño" || genKey === "Niña") {
      if (!/(ni[ñn]o|ni[ñn]a|kid|infantil)/i.test(lowerNombre)) continue;
    }
    cats.add(catLabel);
  }
  return Array.from(cats);
}

const before = data.length;
let totalCategoriasRemoved = 0;
let productosChanged = 0;
let productosAddedDerived = 0;

for (const p of data) {
  const origCats = p.categorias || [];
  let validCats = origCats.filter(isValidCategoria);
  // Also remove spurious "Niños" if the name doesn't suggest kids
  const lowerNombre = (p.nombre || "").toLowerCase();
  if (!/(ni[ñn]o|ni[ñn]a|kid|infantil)/i.test(lowerNombre)) {
    validCats = validCats.filter((c) => c !== "Niños");
  }
  const removed = origCats.length - validCats.length;
  if (removed > 0) {
    totalCategoriasRemoved += removed;
    productosChanged++;
  }

  // If no valid cats, try to derive from genero
  let finalCats = validCats;
  if (finalCats.length === 0) {
    const derived = deriveCatsFromGenero(p.genero, p.nombre);
    if (derived.length > 0) {
      finalCats = derived;
      productosAddedDerived++;
    }
  }

  p.categorias = finalCats;
}

const after = data.length;
fs.writeFileSync(INPUT, JSON.stringify(data));
fs.writeFileSync(REPORT, JSON.stringify({
  productos_before: before,
  productos_after: after,
  productos_changed: productosChanged,
  productos_added_derived_cat: productosAddedDerived,
  total_invalid_categorias_removed: totalCategoriasRemoved,
}, null, 2));

console.log("=== Filter Invalid Categorias (conservative) ===");
console.log("Productos before:", before);
console.log("Productos after :", after);
console.log("Changed:", productosChanged);
console.log("Derived cats added:", productosAddedDerived);
console.log("Total invalid categorias removed:", totalCategoriasRemoved);
