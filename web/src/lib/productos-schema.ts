import { z } from "zod";

const RawProductoSchema = z.object({
  id: z.number(),
  url: z.string().catch(""),
  nombre: z.string().catch(""),
  precio: z.number().catch(0),
  precio_texto: z.string().optional(),
  descripcion: z.string().catch(""),
  resumen: z.string().catch(""),
  categorias: z.array(z.string()).catch([]),
  atributos: z.record(z.string(), z.string()).catch({}),
  imagenes: z.array(z.string()).catch([]),
  marca: z.string().catch(""),
  concentracion: z.string().catch(""),
  tamano: z.string().catch(""),
  genero: z.string().catch(""),
  ocasion: z.string().catch(""),
  familia_olfativa: z.string().catch(""),
  familias_olfativas: z.array(z.string()).catch([]),
  ocasiones: z.array(z.string()).catch([]),
  generos: z.array(z.string()).catch([]),
});

export type RawProducto = z.input<typeof RawProductoSchema>;

export function parseProductos(raw: unknown): z.output<typeof RawProductoSchema>[] {
  const arr = z.array(RawProductoSchema).safeParse(raw);
  if (!arr.success) return [];
  return arr.data;
}
