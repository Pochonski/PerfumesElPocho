#!/usr/bin/env python3
"""
Fast product detail scraper using pre-discovered valid IDs.
"""
import json, os, re, time, sys
from pathlib import Path
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://essenzaperfumes.cr"
OUTPUT_DIR = Path(__file__).parent / "output"
IMAGES_DIR = OUTPUT_DIR / "images"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"}

DELAY = 0.1  # seconds between detail requests
SESSION = requests.Session()
SESSION.headers.update(HEADERS)

def fetch(url):
    for attempt in range(3):
        try:
            return SESSION.get(url, timeout=20)
        except:
            time.sleep(1)
    return None

def is_valid_categoria(text: str) -> bool:
    """Filter out garbage categories (sizes, occasions, families) and keep only real ones."""
    if not text:
        return False
    
    lower = text.lower()
    
    # Exclude sizes (100ML, 50ML, 10ml, etc.)
    if re.search(r'\d+\s*[mM][lL]', text):
        return False
    
    # Exclude occasions
    occasion_words = ['día', 'dia', 'noche', 'verano', 'invierno']
    if any(w in lower for w in occasion_words):
        return False
    
    # Exclude fragrance families (AMADERADO, AROMATICA, FLORAL, etc.)
    family_words = [
        'amaderad', 'aromatic', 'floral', 'oriental', 'cítrica', 'citrica',
        'frutal', 'especiad', 'acuátic', 'acquatic', 'gourmand', 'fougere',
        'avainillad', 'amber', 'ámbar', 'chypre', 'cuero',
    ]
    if any(w in lower for w in family_words):
        return False
    
    # Exclude multi-piece packs (4PZS, 3PZS, etc.)
    if re.search(r'^\d+\s*pzs?', lower):
        return False
    
    # Exclude generic words
    if lower in ['inicio', 'home', 'tienda', 'todos']:
        return False
    
    return True


def scrape_product(pid):
    """Scrape a single product by ID."""
    url = f"{BASE_URL}/producto.php?id={pid}"
    resp = fetch(url)
    if not resp or resp.status_code != 200:
        return None
    
    soup = BeautifulSoup(resp.text, "html.parser")
    
    data = {
        "id": pid,
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
    
    # Name
    h1 = soup.select_one(".product-single-info h1")
    if h1:
        data["nombre"] = h1.get_text(strip=True)
    
    # Price
    price_el = soup.select_one(".price-current")
    if price_el:
        t = price_el.get_text(strip=True)
        data["precio_texto"] = t
        digits = re.sub(r'[^\d.]', '', t)
        if digits:
            data["precio"] = int(float(digits))
    
    # Short description
    short = soup.select_one(".product-single-info > .product-single-desc")
    if short:
        data["resumen"] = short.get_text(strip=True)
    
    # Full description
    desc = soup.select_one(".product-description-panel .product-single-desc")
    if desc:
        data["descripcion"] = desc.get_text(strip=True)
    elif short:
        data["descripcion"] = short.get_text(strip=True)
    
    # Images from thumb buttons
    seen_img = set()
    for btn in soup.select(".product-thumb-btn"):
        src = btn.get("data-image")
        if src and src not in seen_img:
            seen_img.add(src)
            data["imagenes"].append(src)
    
    if not data["imagenes"]:
        main = soup.select_one("#product-main-image")
        if main and main.get("src"):
            data["imagenes"].append(main["src"])
    
    # Attributes table
    for row in soup.select(".product-data-table tr"):
        th = row.select_one("th")
        td = row.select_one("td")
        if th and td:
            key = th.get_text(strip=True).lower()
            val = td.get_text(strip=True)
            data["atributos"][key] = val
            if "concentra" in key:
                data["concentracion"] = val
            if "tamaño" in key or "tamano" in key:
                data["tamano"] = val.upper()
    
    # Categories from breadcrumbs (filtered)
    for a in soup.select(".product-breadcrumb a"):
        text = a.get_text(strip=True)
        if text and text.lower() not in ["inicio", "home"]:
            if is_valid_categoria(text) and text not in data["categorias"]:
                data["categorias"].append(text)
    
    # Try to extract more from all text
    all_text = soup.get_text()
    
    # Marca
    m = re.search(r'(?:Marca|marca)\s*[:]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s&\-]{2,30}?)(?:[\n,]|$)', all_text)
    if m:
        data["marca"] = m.group(1).strip()
    
    # Género
    gen = []
    if re.search(r'\bMujer\b', all_text, re.I): gen.append("Mujer")
    if re.search(r'\bHombre\b', all_text, re.I): gen.append("Hombre")
    if re.search(r'\bUnisex\b', all_text, re.I): gen.append("Unisex")
    if re.search(r'\bNiños?\b', all_text, re.I): gen.append("Niños")
    data["genero"] = ", ".join(gen) if gen else ""
    
    # Familia olfativa
    familias = ["ORIENTAL", "FLORAL", "AMADERADA", "CÍTRICA", "CTRICA", "FRUTAL",
                "ESPECIADA", "ACUÁTICA", "ACUATICA", "GOURMAND", "FOUGERE",
                "AVAINILLADA", "AROMÁTICA", "AROMATICA", "AMBER", "ÁMBAR", "AMBAR"]
    found_fam = set()
    for fam in familias:
        if re.search(r'\b' + re.escape(fam) + r'\b', all_text, re.I):
            found_fam.add(fam.title())
    data["familia_olfativa"] = ", ".join(found_fam) if found_fam else ""
    
    # Ocasión
    ocas = []
    if re.search(r'\bD[ií]a\b', all_text, re.I): ocas.append("Día")
    if re.search(r'\bNoche\b', all_text, re.I): ocas.append("Noche")
    if re.search(r'\bVerano\b', all_text, re.I): ocas.append("Verano")
    if re.search(r'\bInvierno\b', all_text, re.I): ocas.append("Invierno")
    data["ocasion"] = ", ".join(ocas) if ocas else ""
    
    return data


def download_images(products):
    """Download all product images."""
    print(f"\n🖼️ Downloading images...")
    downloaded = 0
    skipped = 0
    
    for i, p in enumerate(products):
        if not p or not p.get("imagenes"):
            continue
        
        pid = p["id"]
        new_imgs = []
        for j, img_url in enumerate(p["imagenes"]):
            ext = os.path.splitext(urlparse(img_url).path or ".jpg")[1]
            if ext.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
                ext = ".jpg"
            
            if len(p["imagenes"]) == 1:
                fname = f"{pid}{ext}"
            else:
                fname = f"{pid}_{j+1}{ext}"
            
            fpath = IMAGES_DIR / fname
            new_imgs.append({"url": img_url, "local": f"images/{fname}"})
            
            if fpath.exists():
                skipped += 1
                continue
            
            resp = fetch(img_url)
            if resp and resp.status_code == 200:
                with open(fpath, "wb") as f:
                    f.write(resp.content)
                downloaded += 1
        
        p["imagenes"] = new_imgs
        
        if (i + 1) % 200 == 0:
            print(f"  Progress: {i+1}/{len(products)} | downloaded: {downloaded}")
    
    print(f"  ✅ {downloaded} downloaded, {skipped} already existed")
    return products


def main():
    # Load valid IDs
    with open(OUTPUT_DIR / "valid_ids.json") as f:
        valid_ids = json.load(f)
    
    print(f"📝 Scraping {len(valid_ids)} products...")
    
    productos = []
    for i, pid in enumerate(valid_ids):
        data = scrape_product(pid)
        if data and data["nombre"]:
            productos.append(data)
        
        if (i + 1) % 100 == 0:
            pct = (i + 1) / len(valid_ids) * 100
            print(f"  [{i+1}/{len(valid_ids)}] {pct:.0f}% | {len(productos)} valid so far | latest: {data['nombre'][:50] if data else '???'}")
            # Save checkpoint
            with open(OUTPUT_DIR / "parcial.json", "w", encoding="utf-8") as f:
                json.dump(productos, f, ensure_ascii=False, indent=2)
        
        time.sleep(DELAY)
    
    print(f"\n✅ Scraped {len(productos)} products with data")
    
    # Download images
    productos = download_images(productos)
    
    # Save final
    print(f"\n💾 Saving productos.json ({len(productos)} products)...")
    with open(OUTPUT_DIR / "productos.json", "w", encoding="utf-8") as f:
        json.dump(productos, f, ensure_ascii=False, indent=2)
    
    # Stats
    prices = [p["precio"] for p in productos if p.get("precio")]
    total_imgs = sum(len(p.get("imagenes", [])) for p in productos)
    print(f"\n✅ Done!")
    print(f"   Products: {len(productos)}")
    print(f"   Images: {total_imgs}")
    if prices:
        print(f"   Prices: ₡{min(prices):,} - ₡{max(prices):,}")


if __name__ == "__main__":
    main()
