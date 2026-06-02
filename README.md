# Perfumes El Pocho 🕯️

**Fragancias que dejan huella.** Plataforma de e-commerce para reventa de perfumes originales, árabes y de diseñador con envíos a todo Costa Rica.

---

## 🧠 Arquitectura

```
PerfumesElPocho/
├── scraper/              # Python — Extracción de datos
│   ├── fast_scrape.py    # Scraper principal (ID-based)
│   ├── scraper.py        # Scraper legacy (categorías)
│   ├── requirements.txt  # requests, beautifulsoup4
│   └── output/
│       ├── valid_ids.json    # 4,155 IDs válidos descubiertos
│       ├── productos.json    # Catálogo completo (cuando termine)
│       └── images/           # ~8,000+ imágenes de productos
│
└── web/                  # Next.js 16 — Frontend
    ├── src/app/
    │   ├── layout.tsx            # Geist fonts + SmoothScrollProvider
    │   ├── page.tsx              # Hero + ProductGrid + CTA + Footer
    │   ├── globals.css           # Design tokens + neumorphic system
    │   └── producto/[id]/        # Página individual de producto
    ├── src/components/
    │   ├── sections/             # Hero, ProductGrid, FinalCTA, Footer
    │   ├── ui/                   # AnimatedSection, Button, Navbar, etc.
    │   └── providers/            # SmoothScrollProvider (Lenis)
    └── src/lib/
        └── productos.ts          # Carga y parsea el JSON del scraper
```

## 🚀 Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 + React 19 + TypeScript |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion 12 + Lenis smooth scroll |
| Diseño | Neumorphic + Glassmorphism (dark mode) |
| Scraping | Python 3 + BeautifulSoup 4 + requests |
| Fuente de datos | [essenzaperfumes.cr](https://essenzaperfumes.cr) |

## 🎨 Design System

- **Paleta:** Negro profundo (#080808) + Dorado/Ámbar (#c8a84e) + Zinc escala
- **Sombras:** Neumorphic 6-capas + inset highlight
- **Tipografía:** Geist Sans + Mono, tracking tight, gold gradient headings
- **Hero:** Canvas procedural con partículas doradas, rayos de luz, y glow radial
- **Productos:** Cards neumorphic con 3D tilt hover + glassmorphism filters

## 📊 Datos

- **Fuente:** essenzaperfumes.cr
- **Productos descubiertos:** 4,155 (rango IDs: 1–4708)
- **Categorías:** Perfumes de Mujer/Hombre/Unisex, Árabes, Estuches, Splash y Cremas, Ofertas, 200ml, Niños
- **Rango de precios:** ₡6,500 – ₡190,000
- **Imágenes por producto:** 1–4 (hosteadas en S3)

## 🏃 Quick Start

```bash
# Scraper
cd scraper
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python fast_scrape.py

# Web
cd web
npm install
npm run dev
```

## 📝 Notas

- Los precios se copian exactos de la fuente. El dueño ajusta manualmente los que necesite margen diferente.
- Las imágenes se sirven localmente desde `web/public/images/` (symlink a `scraper/output/images/`).
- El sitio usa SSG (Static Site Generation) — rebuild para actualizar catálogo.
- Fase 2: Pipeline IA para generar secuencias 3D de cada botella (canvas frame-sequence en páginas de producto).

## 👤 Dueño

Joseph Fonseca — [@Pochonski](https://github.com/Pochonski)

---

*Built with love (and caffeine) by ClaudioElHpBot 🤖☕*
