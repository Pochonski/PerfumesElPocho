#!/usr/bin/env python3
"""
Essenza Perfumes Scraper
Scrapes essenzaperfumes.cr for product catalog data:
- Names, prices, descriptions, categories, attributes, images
- Outputs productos.json and downloads product images
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import re
import time
import sys
import hashlib
from urllib.parse import urljoin, urlparse
from pathlib import Path

BASE_URL = "https://essenzaperfumes.cr"
OUTPUT_DIR = Path(__file__).parent / "output"
IMAGES_DIR = OUTPUT_DIR / "images"
JSON_FILE = OUTPUT_DIR / "productos.json"
DELAY = 0.3  # seconds between requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-CR,es;q=0.9,en;q=0.8",
}

CATEGORIES = [
    ("perfumes-de-mujer", "Perfumes de Mujer"),
    ("perfumes-de-hombre", "Perfumes de Hombre"),
    ("perfumes-unisex", "Perfumes Unisex"),
    ("arabes", "Árabes"),
    ("estuches", "Estuches"),
    ("splash-y-cremas", "Splash y Cremas"),
    ("ofertas", "Ofertas"),
    ("perfumes-200ml", "Perfumes 200ml"),
    ("ninos", "Niños"),
]


def fetch(url, retries=3):
    """Fetch a URL with retries."""
    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            resp.raise_for_status()
            return resp
        except requests.RequestException as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                print(f"  ⚠️ Error fetching {url}: {e}")
                return None


def discover_product_urls():
    """Iterate through all category pages to collect unique product URLs."""
    seen = set()
    products = []
    
    for slug, name in CATEGORIES:
        print(f"\n📂 Categoría: {name}")
        page = 1
        
        offset = 0
        page = 1
        
        while True:
            if offset == 0:
                url = f"{BASE_URL}/categoria.php?slug={slug}"
            else:
                url = f"{BASE_URL}/categoria.php?slug={slug}&offset={offset}"
            
            resp = fetch(url)
            if not resp:
                break
            
            soup = BeautifulSoup(resp.text, "html.parser")
            
            # Find product links
            found = 0
            for link in soup.select("a[href*='producto.php?id=']"):
                href = link["href"]
                full_url = urljoin(BASE_URL, href)
                
                # Extract product ID (skip cart links)
                if "add-to-cart" in href:
                    continue
                match = re.search(r'id=(\d+)', href)
                if not match:
                    continue
                pid = int(match.group(1))
                
                if pid not in seen:
                    seen.add(pid)
                    products.append({
                        "id": pid,
                        "url": full_url,
                        "name": link.get_text(strip=True),
                    })
                    found += 1
            
            print(f"  Página {page} (offset={offset}): {found} nuevos (total: {len(products)} únicos)")
            
            if found == 0:
                break  # no more products
            
            offset += found
            page += 1
            time.sleep(DELAY)
    
    print(f"\n✅ Total productos únicos descubiertos: {len(products)}")
    return products


def scrape_product(product):
    """Scrape detailed info from a product page."""
    url = product["url"]
    resp = fetch(url)
    if not resp:
        return None
    
    soup = BeautifulSoup(resp.text, "html.parser")
    data = {
        "id": product["id"],
        "url": url,
        "nombre": "",
        "precio": 0,
        "precio_texto": "",
        "descripcion": "",
        "resumen": "",
        "categorias": [],
        "atributos": {},
        "imagenes": [],
        "marca": "",
        "concentracion": "",
        "tamano": "",
        "genero": "",
        "ocasion": "",
        "familia_olfativa": "",
    }
    
    # Product name
    name_el = soup.select_one(".product-single-info h1")
    if name_el:
        data["nombre"] = name_el.get_text(strip=True)
    else:
        data["nombre"] = product.get("name", "")
    
    # Price
    price_el = soup.select_one(".price-current")
    if price_el:
        price_text = price_el.get_text(strip=True)
        data["precio_texto"] = price_text
        # Extract digits, keep decimal: "₡23000.00" -> 23000
        digits = re.sub(r'[^\d.]', '', price_text)
        if digits:
            data["precio"] = int(float(digits))
    
    # Short description (top of page)
    short_desc = soup.select_one(".product-single-info > .product-single-desc")
    
    # Full description (in the description section)
    desc_el = soup.select_one(".product-description-panel .product-single-desc")
    if desc_el:
        data["descripcion"] = desc_el.get_text(strip=True)
    elif short_desc:
        data["descripcion"] = short_desc.get_text(strip=True)
    
    # Short summary (separate field, for cards)
    if short_desc:
        data["resumen"] = short_desc.get_text(strip=True)
    
    # Images - from product thumbs (data-image has full-size)
    seen_images = set()
    for btn in soup.select(".product-thumb-btn"):
        img_src = btn.get("data-image")
        if img_src and img_src not in seen_images:
            seen_images.add(img_src)
            data["imagenes"].append(img_src)
    
    # Fallback: main image
    if not data["imagenes"]:
        main_img = soup.select_one("#product-main-image")
        if main_img:
            src = main_img.get("src")
            if src:
                full_src = urljoin(BASE_URL, src)
                data["imagenes"].append(full_src)
    
    # Fallback: any product image
    if not data["imagenes"]:
        for img in soup.select(".product-gallery img, .product-single-image img"):
            src = img.get("src") or img.get("data-src")
            if src and not src.endswith('.svg'):
                full_src = urljoin(BASE_URL, src)
                if full_src not in seen_images:
                    seen_images.add(full_src)
                    data["imagenes"].append(full_src)
    
    # Attributes from product data table
    for row in soup.select(".product-data-table tr"):
        th = row.select_one("th")
        td = row.select_one("td")
        if th and td:
            key = th.get_text(strip=True).lower()
            value = td.get_text(strip=True)
            data["atributos"][key] = value
            if "concentración" in key or "concentracion" in key:
                data["concentracion"] = value
            if "tamaño" in key or "tamano" in key:
                data["tamano"] = value.upper()
    
    # Breadcrumbs for categories (exclude "Inicio")
    for link in soup.select(".product-breadcrumb a"):
        text = link.get_text(strip=True)
        if text and text.lower() not in ["inicio", "home"]:
            data["categorias"].append(text)
    
    # Deduplicate categories
    data["categorias"] = list(dict.fromkeys(data["categorias"]))
    
    all_text = soup.get_text()
    
    # Try to extract marca from product name or structured data
    # Common pattern: "PRODUCT NAME MARCA" or structured marca field
    marca_match = re.search(r'(?:Marca|marca)\s*[:]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s&\-]+?)(?:\n|$|[,.])', all_text)
    if marca_match:
        data["marca"] = marca_match.group(1).strip()
    
    # Extract genre
    genero_patterns = {
        "Mujer": [r'\bMujer\b', r'\bFemenin[oa]\b'],
        "Hombre": [r'\bHombre\b', r'\bMasculin[oa]\b'],
        "Unisex": [r'\bUnisex\b', r'\bUni[sx]ex\b'],
        "Niños": [r'\bNi[ñn]os?\b', r'\bNi[ñn]as?\b', r'\bKids\b', r'\bInfantil\b'],
    }
    found_generos = []
    for gen, patterns in genero_patterns.items():
        for pat in patterns:
            if re.search(pat, all_text, re.I):
                found_generos.append(gen)
                break
    data["genero"] = ", ".join(found_generos) if found_generos else ""
    
    # Extract fragrance family
    familias = [
        "ORIENTAL", "FLORAL", "AMADERADA", "CÍTRICA", "CTRICA", "FRUTAL",
        "ESPECIADA", "ACUÁTICA", "ACUATICA", "GOURMAND", "FOUGERE",
        "AVAINILLADA", "AROMÁTICA", "AROMATICA", "AMBER", "ÁMBAR", "AMBAR",
    ]
    found_familias = set()
    for fam in familias:
        pattern = re.compile(r'\b' + re.escape(fam) + r'\b', re.I)
        if pattern.search(all_text):
            found_familias.add(fam.title())
    # Also try combined patterns like "ORIENTAL FLORAL"
    combined = re.findall(r'(ORIENTAL|FLORAL|AMADERADA|CÍTRICA|CTRICA|FRUTAL|ESPECIADA|ACUÁTICA|ACUATICA|GOURMAND|FOUGERE|AVAINILLADA|AROMÁTICA|AROMATICA)\s+(ORIENTAL|FLORAL|AMADERADA|CÍTRICA|CTRICA|FRUTAL|ESPECIADA|ACUÁTICA|ACUATICA|GOURMAND|FOUGERE|AVAINILLADA|AROMÁTICA|AROMATICA)', all_text, re.I)
    if combined:
        data["familia_olfativa"] = ", ".join([" ".join(c).title() for c in combined])
    elif found_familias:
        data["familia_olfativa"] = ", ".join(found_familias)
    
    # Extract occasion
    ocasiones = set()
    if re.search(r'\bD[ií]a\b', all_text, re.I):
        ocasiones.add("Día")
    if re.search(r'\bNoche\b', all_text, re.I):
        ocasiones.add("Noche")
    if re.search(r'\bVerano\b', all_text, re.I):
        ocasiones.add("Verano")
    if re.search(r'\bInvierno\b', all_text, re.I):
        ocasiones.add("Invierno")
    data["ocasion"] = ", ".join(ocasiones) if ocasiones else ""
    
    return data


def download_images(products):
    """Download all product images."""
    print(f"\n🖼️ Descargando imágenes...")
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    
    downloaded = 0
    skipped = 0
    for product in products:
        pid = product["id"]
        for i, img_url in enumerate(product["imagenes"]):
            # Create filename from URL hash
            ext = os.path.splitext(urlparse(img_url).path)[1]
            if not ext or ext.lower() not in ['.jpg', '.jpeg', '.png', '.webp']:
                ext = '.jpg'
            
            if len(product["imagenes"]) == 1:
                fname = f"{pid}{ext}"
            else:
                fname = f"{pid}_{i+1}{ext}"
            
            fpath = IMAGES_DIR / fname
            
            # Update product data with local path
            product["imagenes"][i] = {
                "url": img_url,
                "local": f"images/{fname}",
            }
            
            if fpath.exists():
                skipped += 1
                continue
            
            resp = fetch(img_url)
            if resp and resp.status_code == 200:
                with open(fpath, "wb") as f:
                    f.write(resp.content)
                downloaded += 1
        
        if len(products) % 50 == 0:
            print(f"  Progreso: {len([p for p in products if p['id'] <= pid])}/{len(products)} productos...")
        time.sleep(0.1)
    
    print(f"  ✅ {downloaded} imágenes descargadas, {skipped} ya existían")


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"
    
    print("🔍 Essenza Perfumes Scraper")
    print("=" * 50)
    
    # Step 1: Discover products
    if mode in ("full", "discover"):
        print("\n📋 Descubriendo productos...")
        products = discover_product_urls()
        
        # Save intermediate discovery
        with open(OUTPUT_DIR / "descubiertos.json", "w", encoding="utf-8") as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
    else:
        with open(OUTPUT_DIR / "descubiertos.json", "r", encoding="utf-8") as f:
            products = json.load(f)
        print(f"\n📋 Cargados {len(products)} productos desde caché")
    
    # Step 2: Scrape details
    if mode in ("full", "details"):
        print(f"\n📝 Scrapeando detalles de {len(products)} productos...")
        detailed = []
        
        for i, product in enumerate(products):
            print(f"  [{i+1}/{len(products)}] ID: {product['id']} - {product['name'][:60]}")
            data = scrape_product(product)
            if data:
                detailed.append(data)
            else:
                print(f"    ⚠️ No se pudo scrapear")
            
            # Save progress every 50 products
            if (i + 1) % 50 == 0:
                with open(OUTPUT_DIR / "parcial.json", "w", encoding="utf-8") as f:
                    json.dump(detailed, f, ensure_ascii=False, indent=2)
                print(f"    💾 Guardado parcial ({len(detailed)} productos)")
            
            time.sleep(DELAY)
        
        products = detailed
    else:
        with open(OUTPUT_DIR / "parcial.json", "r", encoding="utf-8") as f:
            products = json.load(f)
        print(f"\n📝 Cargados {len(products)} productos detallados desde caché")
    
    # Step 3: Download images
    if mode in ("full", "images"):
        download_images(products)
    
    # Step 4: Save final JSON
    print(f"\n💾 Guardando {len(products)} productos en {JSON_FILE}...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ ¡Listo!")
    print(f"   Productos: {len(products)}")
    print(f"   JSON: {JSON_FILE}")
    print(f"   Imágenes: {IMAGES_DIR}")
    
    # Stats
    total_images = sum(len(p.get("imagenes", [])) for p in products)
    print(f"   Total imágenes: {total_images}")
    
    # Price range
    prices = [p.get("precio", 0) for p in products if p.get("precio")]
    if prices:
        print(f"   Rango de precios: ₡{min(prices):,} - ₡{max(prices):,}")


if __name__ == "__main__":
    main()
