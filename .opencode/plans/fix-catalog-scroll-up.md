# Plan: Evitar scroll-up al filtrar/cambiar precio en el catálogo

## Diagnóstico

### Causa raíz
Cuando el usuario está scrolleado hacia abajo en el catálogo y aplica un filtro (o mueve el slider de precio), la página salta hacia arriba. La causa es **layout shift + auto-clamp del browser**, no el código de scroll restoration que tenemos.

### Flujo actual (CatalogClient.tsx:225-234 + 178-222)

1. Usuario hace click en filtro → `pushState(next)`:
   ```js
   setPage(1);
   pendingScrollY.current = window.scrollY;        // guarda scroll
   router.replace(pathname + '?' + qs, { scroll: false });
   ```
2. React re-renderiza con nuevo `filtrosState`
3. `useLayoutEffect` corre (línea 167-176):
   ```js
   window.scrollTo({ top: y, behavior: "instant" });   // restaura scroll ✓
   ```
4. `useEffect` corre (línea 178-222):
   ```js
   setLoading(true);                                  // ⚠️ siempre
   fetch('/api/productos?...').then(setProductos);   // async
   ```
5. Mientras el fetch está en vuelo, se ven productos viejos
6. Fetch termina → `setProductos(newItems)` → grid re-renderiza
7. **PROBLEMA**: Si el filtro reduce resultados (ej: 1262 → 23 productos), el grid es MÁS CORTO. La página se encoge.
8. **El browser automáticamente clampa scrollY al nuevo maxScroll** → usuario salta hacia arriba.

### Por qué `pendingScrollY` no resuelve
- `useLayoutEffect` corre ANTES de que llegue la respuesta del fetch
- Cuando llegan los productos, el browser ya hizo el clamp
- El scroll restoration ya pasó

### Otros problemas secundarios detectados
1. **Skeleton flash**: `setLoading(true)` en cada cambio de filtro → flash de skeleton → productos viejos → productos nuevos (ruido visual + layout shift extra)
2. **Sin debounce en price slider**: `PriceRange.tsx:67` llama `onChangeRef.current(...)` en `pointerup`, pero el slider dispara `setLocalMin/setLocalMax` en cada pixel durante el drag → cada movimiento re-renderiza
3. **`useLayoutEffect` innecesario**: `router.replace` con `{ scroll: false }` ya previene el scroll de Next.js. El layout-effect solo agrega complejidad sin valor real una vez resuelto el clamp.

---

## Solución propuesta

### 1. CSS `overflow-anchor: auto` (cambio principal, 1 línea)
Esta propiedad CSS estándar (Chrome 69+, Firefox 66+, Safari 13.1+) hace que el browser mantenga automáticamente la posición de scroll cuando el contenido cambia por encima o por debajo del viewport. Es exactamente lo que necesitamos.

**Ubicación**: `CatalogClient.tsx` línea 462, en el div que contiene el grid de productos.

```jsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 overflow-anchor-auto">
```

### 2. Evitar skeleton flash en cambios de filtro
Solo mostrar skeleton en carga inicial (cuando no hay productos todavía). En cambios de filtro, mantener productos viejos visibles con un indicador sutil.

**Ubicación**: `CatalogClient.tsx` líneas 178-181 (el `setLoading(true)`)

```js
// Antes:
setLoading(true);

// Después: solo en carga inicial
if (productos.length === 0) setLoading(true);
```

Y actualizar la UI del "loading" para que sea solo un texto pequeño, no un skeleton que reemplace el grid completo.

### 3. Quitar el `useLayoutEffect` (cleanup)
Una vez que `overflow-anchor` maneja el scroll, el useLayoutEffect es innecesario. Lo dejo como safety net pero más simple.

**Ubicación**: `CatalogClient.tsx` líneas 167-176.

### 4. Debounce del price slider (mejora adicional)
Hacer que el slider solo dispare `pushState` cuando el usuario suelte el mouse (no en cada pixel durante el drag). Esto también reduce drasticamente el número de fetches mientras el usuario arrastra.

**Ubicación**: `PriceRange.tsx` línea 67. El `onChange` ya se llama en `pointerup` — pero el slider también dispara `setLocalMin/setLocalMax` en cada movimiento del drag (líneas 55-63), que causa re-renders del componente padre.

Verificar si estos setState locales pueden optimizarse para no causar renders del padre durante el drag. La solución: `useDeferredValue` o un componente aislado.

### 5. Animación del AnimatedItem no re-trigger al cambiar filtros
El `key={p.id}` está bien, pero al cambiar de página los items se desmontan y remontan → re-anima. Esto puede sentirse brusco. Considerar usar `LayoutGroup` de Framer Motion para transiciones suaves, pero es nice-to-have.

---

## Archivos a modificar

| Archivo | Cambios |
|---|---|
| `web/src/components/sections/CatalogClient.tsx` | (1) `overflow-anchor-auto` en grid, (2) skip `setLoading(true)` en cambios de filtro, (3) simplificar `useLayoutEffect` |
| `web/src/components/filters/PriceRange.tsx` | (4) optimizar re-renders durante drag (opcional pero recomendado) |

## Lo que NO se rompe
- Scroll restoration al hacer click en "Limpiar todo" (sigue funcionando con `overflow-anchor`)
- Paginación (cambio de página usa la misma lógica)
- Búsqueda con debounce (ya funciona bien)
- Animaciones de productos (siguen igual)

## Tests a verificar después del fix

1. **Test principal**: Estar scrolleado a 2500px, aplicar filtro de marca → scroll debe quedarse en 2500 (no saltar arriba)
2. **Filter reduce resultados**: Aplicar filtro que reduce de 1262 a 23 productos → scroll se mantiene
3. **Filter vacío**: Filtrar a 0 resultados → scroll se mantiene (no colapsa)
4. **Price slider**: Arrastrar slider → scroll se mantiene, no se hacen 50 fetches
5. **Mobile**: Probar en viewport 375x667 con el filter sheet abierto

## Orden de implementación

1. Cambio #1 (`overflow-anchor`) → build → deploy → test inmediato
2. Si funciona, aplicar cambios #2 y #3 en el mismo deploy
3. Cambio #4 (price slider) solo si se observa lag visual durante el drag

## Riesgo

- `overflow-anchor` está ampliamente soportado (caniuse: ~96% global). En navegadores sin soporte, el comportamiento actual persiste (con el bug). Es aceptable.
- Si en testing se observa que el grid salta antes del cambio de productos (es decir, durante el flash de skeleton), el cambio #2 lo resuelve.