export interface Guia {
  slug: string;
  title: string;
  description: string;
  category: string;
  readMinutes: number;
  publishedAt: string;
  content: string;
}

export const GUIAS: Guia[] = [
  {
    slug: "como-elegir-tu-perfume-segun-tu-personalidad",
    title: "Cómo elegir tu perfume según tu personalidad",
    description:
      "Una guía para encontrar la fragancia que mejor representa quién sos. Notas, familias olfativas y ocasiones.",
    category: "Guía de compra",
    readMinutes: 6,
    publishedAt: "2026-01-15",
    content: `Elegir un perfume es elegir cómo querés que el mundo te recuerde. No se trata solo de oler bien: se trata de identidad.

## Conocé las familias olfativas

- **Florales:** rosas, jazmín, peonía. Para personalidades románticas y delicadas.
- **Amaderados:** sándalo, cedro, vetiver. Para espíritus cálidos y profundos.
- **Orientales / Ámbar:** vainilla, incienso, mirra. Para personas misteriosas y sofisticadas.
- **Cítricos / Hespérides:** bergamota, limón, pomelo. Para personnalités frescas y energéticas.
- **Chipre:** musgo de roble, pachulí, bergamota. Para clásicos elegantes.
- **Aromáticos / Fougère:** lavanda, romero, salvia. Para hombres con carácter.

## La regla de los tres usos

Probá un perfume durante **al menos 8 horas** antes de comprarlo. Las notas de salida (los primeros 15 minutos) son las que más llaman la atención, pero las notas de corazón y fondo son las que definen la fragancia.

## Cuándo usar cada intensidad

- **Ligero (EDT, EDC):** de día, oficina, climas cálidos
- **Medio (EDP):** tarde, citas, eventos casuales
- **Intenso (Parfum, Elixir):** noche, eventos formales, climas fríos

¿Tenés dudas? Escribinos por WhatsApp y te recomendamos personalmente.`,
  },
  {
    slug: "diferencia-entre-edt-edp-y-parfum",
    title: "Diferencia entre EDT, EDP y Parfum",
    description:
      "Concentración, duración y para quién es cada tipo. Aprendé a leer las etiquetas.",
    category: "Educación",
    readMinutes: 4,
    publishedAt: "2026-01-20",
    content: `La diferencia entre un Eau de Toilette, Eau de Parfum y Parfum es la **concentración de aceites esenciales**, lo cual afecta directamente la duración, proyección y precio.

## Concentraciones típicas

| Tipo | Concentración | Duración aprox. |
|------|---------------|-----------------|
| Eau de Cologne (EDC) | 3-5% | 2-3 horas |
| Eau de Toilette (EDT) | 5-15% | 3-5 horas |
| Eau de Parfum (EDP) | 15-20% | 5-8 horas |
| Parfum / Extrait | 20-40% | 8-12+ horas |

## ¿Cuál elegir?

- Si querés un perfume para **uso diario** y climas cálidos: EDT
- Si buscás **durabilidad y presencia** moderada: EDP (la opción más versátil)
- Si querés invertir en una fragancia para **ocasiones especiales**: Parfum

En Perfumes El Pocho encontrás todas las concentraciones. Filtrá por "Concentración" en el catálogo.`,
  },
  {
    slug: "perfumes-arabes-guia-para-principiantes",
    title: "Perfumes árabes: guía para principiantes",
    description:
      "Por qué los perfumes árabes se volvieron tendencia mundial y qué los hace únicos.",
    category: "Cultura",
    readMinutes: 5,
    publishedAt: "2026-02-01",
    content: `Los perfumes árabes conquistaron el mundo. Y no es casualidad: detrás de cada fragancia hay siglos de tradición, ingredientes premium y una obsesión por la duración.

## ¿Qué los hace especiales?

1. **Ingredientes premium:** oud (madera de agar), almizcle, azafrán, rosa de Taif, ámbar
2. **Alta concentración:** muchos son EDP o Parfum puro
3. **Longevidad extrema:** pueden durar **12-24 horas** en piel
4. **Proyección potente:** se huelen a metros de distancia

## Las casas más reconocidas

- **Lattafa:** calidad accesible, excelente relación precio-duración
- **Maison Alhambra:** alternativa de lujo, perfiles modernos
- **Afnan:** fragancias unisex versátiles
- **Armaf:** clones de diseñador con carácter propio

## ¿Cómo aplicarlos?

Menos es más. Con una fragancia árabe intensa, **2-3 pulsaciones** son suficientes:
- Una en el cuello
- Una en la muñeca
- Una en el pecho

¿Listo para probar? Mirá nuestra categoría de **Árabes** en el catálogo.`,
  },
];

export function getGuiaBySlug(slug: string): Guia | undefined {
  return GUIAS.find((g) => g.slug === slug);
}

export function getAllGuias(): Guia[] {
  return [...GUIAS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
