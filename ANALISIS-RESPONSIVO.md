# 🔍 Análisis Exhaustivo — PerfumesElPocho

**Fecha:** 2026-06-06  
**Analista:** Claudio (sub-agente)

---

## Problemas por Severidad

### 🔴 CRÍTICOS

| # | Problema | Afecta | Fix |
|---|----------|--------|-----|
| 1 | `generos: []` vacío en 92% de productos | Filtro de Género no funciona para 2,701 productos | Derivar `generos` desde `genero` (string) en `getProductos()` |
| 2 | `resumen` vacío en 100% (2,929 productos) | SEO metadata y display de producto afectados | Generar resúmenes de 120-160 chars desde `descripcion` |
| 3 | `generateStaticParams` limita a 500 productos | Productos 501+ se sirven con ISR, no pre-renderizados | Evaluar ISR con revalidate o generar más |

---

### 🟠 ALTOS

| # | Problema | Afecta | Fix |
|---|----------|--------|-----|
| 4 | `familias_olfativas` vacío en 16% (482 productos) | Filtro de familia olfativa no funciona | Derivar desde `familia_olfativa` (string singular) |
| 5 | `ocasiones` vacío en 14% (424 productos) | Filtro de ocasión no funciona | Derivar desde `ocasion` (string singular) |
| 6 | 80 categorías mezcladas (tamaños + género + tipos) | "100ML", "50ML", "Perfumes de hombre" como categorías | Separar en campos distintos: `tamano`, `genero_categoria`, `tipo` |
| 7 | Búsqueda case-sensitive y sin normalizar acentos | "oud" no encuentra "Oud" ni "OUD" | Normalizar: `toLowerCase()` + `normalize("NFD")` |
| 8 | Reviews vacío `REVIEWS = []` | Sección reviews no muestra nada | Poblar con datos reales |

---

### 🟡 MEDIOS

| # | Problema | Fix |
|---|----------|-----|
| 9 | 486 productos sin `marca` (16%) | Mostrar "Sin marca" |
| 10 | 38 productos con `atributos.marca` ≠ `marca` | Unificar, usar solo top-level |
| 11 | 330 productos sin `descripcion` | Generar fallback desde nombre + marca |
| 12 | Filtro de marca en API es case-sensitive | Normalizar ambos lados a lowercase |
| 13 | Sin validación Zod en API route | Usar Zod para validar searchParams |
| 14 | Sin rate limiting en `/api/productos` | Implementar rate limiting básico |
| 15 | Sin fallback de imagen robusto | Mejorar placeholder |
| 16 | `precioMin`/`precioMax` pueden ser null | Revisar edge cases en PriceRange |

---

### 🟢 BAJOS

| # | Problema |
|---|----------|
| 17 | Sin `robots.txt` custom |
| 18 | Sin `sitemap` dinámico completo |
| 19 | Canvas Hero puede afectar Core Web Vitals en mobile |
| 20 | No hay `loading.tsx` con skeleton real para producto detail |

---

## 📋 Plan de Trabajo

```
FASE 1 — Datos críticos
├── Fix 1: Derivar generos desde genero en getProductos()
├── Fix 2: Derivar familias_olfativas desde familia_olfativa
├── Fix 3: Derivar ocasiones desde ocasion
├── Fix 4: Generar resumen desde descripcion (fallback)
└── Fix 5: Normalizar búsqueda (case + acentos)

FASE 2 — Search & API
├── Fix 6: Búsqueda case-insensitive + accent-insensitive
├── Fix 7: Filtro de marca case-insensitive
├── Fix 8: Validación Zod en API
└── Fix 9: Rate limiting básico

FASE 3 — UX y display
├── Fix 10: Separar categorías de tamaños/géneros
├── Fix 11: Productos sin marca → "Sin marca"
├── Fix 12: Descripción fallback
├── Fix 13: Poblar REVIEWS
└── Fix 14: Mejorar placeholder de imagen

FASE 4 — Performance & SEO
├── Fix 15: generateStaticParams — evaluar límite de 500
├── Fix 16: Robots.txt custom
├── Fix 17: Sitemap dinámico completo
└── Fix 18: Optimizar canvas Hero para mobile
```

**Total: 18 problemas identificados** — 3 críticos, 5 altos, 8 medios, 2 bajos.