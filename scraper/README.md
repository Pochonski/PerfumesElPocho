# Scraper — Perfumes El Pocho

Scraper para [essenzaperfumes.cr](https://essenzaperfumes.cr) que extrae el catálogo completo de perfumes y lo deja listo para servir desde el sitio web de **Perfumes El Pocho**.

## 📋 Estado actual (Junio 2026)

- **Último raw completo**: 4,109 productos scrapeados el 2 de junio de 2026
- **Último web data**: 2,984 productos con 7 categorías canónicas
- **Pipeline híbrido de imágenes**: S3 del proveedor (preservado) + Cloudflare R2 propio (uploads)
- **Cloudflare R2 bucket**: `perfumes-el-pocho` (región Eastern North America)
- **Public URL**: `https://pub-e703132c460246adacce3867fb9ccf24.r2.dev`

> ⚠️ **Nota importante**: el sitio fuente actualmente (junio 2026) solo expone 12 productos por categoría en su listado paginado. Si el re-scrape devuelve menos de ~1,000 productos, probablemente el sitio está limitando el acceso. Restaurar el raw anterior (ver "Recuperación de emergencia" abajo).

## 🏗️ Arquitectura

```
essenzaperfumes.cr (fuente)
        ↓
   scraper.py  ──────────┐
        ↓                │
   raw output            │  imágenes sin URL S3:
   (productos.json)      │  descarga local + upload
        ↓                ↓
   clean-data.mjs    upload_image.py (boto3)
        ↓                ↓
   filter-categorias.mjs  Cloudflare R2 bucket
        ↓                ↓
   web/src/data/productos.json  (URLs públicas)
        ↓
   Next.js (Vercel deploy)
```

## 🚀 Quick start (re-scrapear)

### 1. Verificar el venv

```bash
cd scraper
ls venv/  # debe existir; si no, recrear:
python3.14 -m venv venv
source venv/bin/activate
pip install -r requirements.txt boto3 python-dotenv
```

### 2. Configurar credenciales R2 (solo primera vez)

```bash
cp .env.scraper.example .env.scraper
nano .env.scraper
```

Llenar:
- `S3_ACCESS_KEY_ID`: tu R2 access key (formato: `a1b2c3d4...`)
- `S3_SECRET_ACCESS_KEY`: tu R2 secret (string largo, ~64 chars)
- `S3_BUCKET`: `perfumes-el-pocho`
- `S3_REGION`: `auto`
- `S3_ENDPOINT_URL`: `https://<account-id>.r2.cloudflarestorage.com`
- `S3_PUBLIC_URL`: `https://pub-<hash>.r2.dev` o tu custom domain

**¿Cómo obtener las credenciales?**

1. Cloudflare dashboard → R2 → **Account API Tokens** → **Create Account API Token**
2. Permisos: `Object Read & Write` sobre el bucket `perfumes-el-pocho`
3. Te muestra **Access Key ID** + **Secret Access Key** (⚠️ el Secret SOLO aparece una vez)

**¿Dónde están las URLs?**

- **Endpoint R2**: `https://<account-id>.r2.cloudflarestorage.com` (lo ves en el bucket settings)
- **Public URL**: en el bucket, sección **Public Development URL** o en **Custom Domains** si configuraste uno

### 3. Validar configuración

```bash
source venv/bin/activate
python -c "from upload_image import is_configured; print('OK' if is_configured() else 'NOT CONFIGURED')"
```

Si dice `OK`, podés continuar. Si dice `NOT CONFIGURED`, revisá el archivo `.env.scraper`.

### 4. Re-scrapear (en background)

```bash
cd scraper
nohup ./venv/bin/python scraper.py full > rerun-$(date +%Y-%m-%d).log 2>&1 &
echo $! > scraper.pid
```

El scraper tarda ~30-60 min (depende de cuántos productos descubra).

### 5. Monitorear progreso

```bash
tail -f rerun-$(date +%Y-%m-%d).log
# O ver últimas líneas:
tail -20 rerun-$(date +%Y-%m-%d).log
```

Vas a ver progreso por categoría, scraping de detalles, y al final el upload a R2:

```
🖼️ Procesando imágenes...
   S3/R2 upload: ON
  Progreso: 100/4109 | uploaded: 12 | preserved: 230
  ✅ preserved remote: 7800
  ✅ downloaded locally: 5
  ✅ uploaded to S3/R2: 5
```

### 6. Validar output

```bash
node -e "
const data = require('./output/productos.json');
console.log('Total:', data.length);
console.log('Sample imagen[0]:', data[0].imagenes?.[0]?.slice(0, 80));
console.log('Sample con R2 URL:', data.filter(p => p.imagenes?.[0]?.includes('r2.dev')).length);
"
```

### 7. Regenerar web data (desde el root del proyecto)

```bash
cd ..  # volver a la raíz del proyecto
cd web
cp src/data/productos.json src/data/productos.backup-$(date +%Y-%m-%d).json  # backup
node scripts/clean-data.mjs
node scripts/filter-categorias.mjs
```

El `clean-data.mjs` lee del raw, normaliza, y genera `productos.cleaned.json`. El `filter-categorias.mjs` aplica el filtro conservador de categorías inválidas.

### 8. Limpiar genero string (opcional pero recomendado)

El scraper a veces scrape `genero: "Mujer, Hombre, Unisex, Niños"` para todos. Este paso limpia esos strings:

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/productos.json'));
const lower = (s) => (s || '').toLowerCase();
let cleaned = 0;
for (const p of data) {
  if (!p.genero) continue;
  const parts = p.genero.split(',').map(s => s.trim()).filter(Boolean);
  const filtered = parts.filter(part => {
    if (/^ni[ñn]os?$|^ni[ñn]as?$/i.test(part)) {
      return /(ni[ñn]o|ni[ñn]a|kid|infantil)/i.test(lower(p.nombre));
    }
    return true;
  });
  const newGenero = filtered.join(', ');
  if (newGenero !== p.genero) { p.genero = newGenero; cleaned++; }
}
console.log('Genero cleaned:', cleaned);
fs.writeFileSync('src/data/productos.json', JSON.stringify(data));
"
```

### 9. Reemplazar el web data y buildear

```bash
# El clean-data.mjs escribe a productos.cleaned.json, hay que moverlo
mv src/data/productos.json src/data/productos.prev.json
mv src/data/productos.cleaned.json src/data/productos.json

# Limpiar reportes
rm -f src/data/clean-report.json src/data/clean-categorias-report.json

# Build para verificar
rm -rf .next
npm run build
```

Si el build tiene éxito, commit + push:

```bash
cd ..
git add scraper/output/ web/src/data/
git commit -m "chore: re-scrape with fresh data from essenzaperfumes.cr"
git push origin master
```

Vercel auto-deploy.

## 🔄 Recuperación de emergencia (si el scraper descubre < 1000 productos)

Si `essenzaperfumes.cr` está limitando el acceso y el rerun descubre solo unos cientos de productos, NO querés perder los 4,000+ del raw anterior.

**Pasos:**

```bash
# El scraper escribe a output/productos.json. Antes de re-scrapear, hacé backup:
cp scraper/output/productos.json scraper/output/productos.backup-$(date +%Y-%m-%d).json

# Después de re-scrapear, si el resultado es pobre:
ls -la scraper/output/productos.json scraper/output/productos.backup-*.json

# Restaurar el backup:
mv scraper/output/productos.json scraper/output/productos.bad-rerun-$(date +%Y-%m-%d).json
cp scraper/output/productos.backup-$(date +%Y-%m-%d).json scraper/output/productos.json

# Regenerar web data desde el raw restaurado (volver al paso 7 del quick start)
```

## 📁 Estructura de archivos

```
scraper/
├── README.md                    # esta guía
├── scraper.py                   # scraper principal (descubrir + detalles + imágenes)
├── fast_scrape.py               # variante rápida usando valid_ids.json
├── upload_image.py              # helper boto3 para subir a R2
├── clean-data.mjs (en web/)     # normaliza raw → web data
├── filter-categorias.mjs (en web/)  # filtro conservador de categorías
├── requirements.txt             # requests, beautifulsoup4
├── .env.scraper.example         # template de credenciales R2
├── .env.scraper                 # (gitignored) credenciales reales
├── venv/                        # Python venv con dependencias
└── output/
    ├── productos.json           # raw scrapeado (4,109 productos)
    ├── valid_ids.json           # IDs descubiertos
    ├── parcial.json             # checkpoint durante scraping
    ├── descubiertos.json        # URLs iniciales
    └── images/                  # (legacy) imágenes locales — no se usa más
```

## 🐛 Troubleshooting

### "No module named 'boto3'"

```bash
source venv/bin/activate
pip install boto3 python-dotenv
```

### "Cloudflare bloqueó el scraper (403)"

El sitio usa Cloudflare. El scraper tiene un `User-Agent` realista, pero si seguís bloqueado:

1. Probá correr desde otra IP (móvil con hotspot)
2. Aumentá `DELAY = 0.3` a `DELAY = 1.0` en `scraper.py` (línea 24)
3. Considerá usar `cloudscraper` lib (no incluida)

### "Solo descubrió 79 productos"

El sitio está limitando el listado. Ver "Recuperación de emergencia" arriba.

### "Las imágenes no se suben a R2"

```bash
# Verificar credenciales
source venv/bin/activate
python -c "
import sys
sys.path.insert(0, '.')
from upload_image import is_configured, _get_client
print('Configured:', is_configured())
client = _get_client()
if client: print('Client OK, region:', client.meta.region_name)
"
```

Si dice `Configured: False`, revisá `.env.scraper` (los valores no pueden ser `replace-me`).

### "Las imágenes locales no se suben"

El nuevo `scraper.py` con `download_images()` híbrido:
- Si la URL ya es S3 del proveedor → preserva la URL como string
- Si no tiene URL → descarga local + sube a R2
- Si R2 no está configurado → fallback a `images/<file>` (path relativo)

Para forzar uploads:
1. Verificá que `.env.scraper` tenga credenciales reales
2. Verificá que `is_configured()` retorne `True`
3. Re-corré el scraper

## 🔐 Seguridad

⚠️ **NUNCA** commitear credenciales reales. El `.gitignore` ya excluye:
- `scraper/.env.scraper`
- `scraper/venv/`
- `scraper/output/images/`

Si por error commiteaste credenciales:
1. **Revocá el token inmediatamente** en Cloudflare → R2 → Account API Tokens → Delete
2. Creá un nuevo token
3. Hacé `git filter-branch` o `git filter-repo` para limpiar el historial
4. Push forzado (con cuidado)

## 📊 Comandos útiles

```bash
# Ver estadísticas del raw
node -e "
const data = require('./output/productos.json');
console.log('Total:', data.length);
console.log('Con precio > 0:', data.filter(p => p.precio > 0).length);
console.log('Rango precios: ₡', Math.min(...data.map(p=>p.precio)), 'a ₡', Math.max(...data.map(p=>p.precio)));
console.log('Categorías únicas:', new Set(data.flatMap(p => p.categorias || [])).size);
"

# Contar imágenes por fuente
node -e "
const data = require('./output/productos.json');
const counts = { s3_proveedor: 0, r2_propio: 0, otros: 0 };
for (const p of data) {
  for (const img of p.imagenes || []) {
    if (img.includes('3pspglobal.s3')) counts.s3_proveedor++;
    else if (img.includes('r2.dev')) counts.r2_propio++;
    else counts.otros++;
  }
}
console.log(counts);
"

# Validar que todas las URLs de R2 sean accesibles
node -e "
const data = require('./output/productos.json');
const r2Urls = new Set();
for (const p of data) for (const img of p.imagenes || []) if (img.includes('r2.dev')) r2Urls.add(img);
console.log('URLs R2 únicas:', r2Urls.size);
console.log('Sample:', Array.from(r2Urls).slice(0, 3));
"
```

## 📝 Changelog

- **2026-06-09**: Pipeline híbrido de imágenes (S3 proveedor + R2 propio). Test upload validado.
- **2026-06-09**: Limpieza masiva de dependencias muertas en web/. Filtro conservador de categorías.
- **2026-06-06**: Re-scrape inicial con categorías limpias. 4,109 productos descubiertos.
- **2026-06-02**: Scrapeo completo. 6,372 imágenes descargadas (versión legacy con imágenes locales).
