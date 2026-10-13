import { notFound } from "next/navigation";
import type { CategoriaTrabajo, TipoArchivo, TipoPieza } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { categoriaToPiezas, motorTexto, piezaToCategoria, PIEZA_LABEL } from "@/lib/labels";
import { parseOrigen } from "@/lib/nav";
import type { EstadoOrden } from "@/lib/types";
import { PresupuestoClient } from "./presupuesto-client";

export default async function PresupuestoPage({
  params,
  searchParams,
}: {
  params: Promise<{ numero: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const numero = Number((await params).numero);
  const from = parseOrigen((await searchParams).from);
  const [orden, catalogo] = await Promise.all([
    prisma.orden.findUnique({
      where: { numero },
      include: { cliente: true, trabajos: true, archivos: true, mediciones: true },
    }),
    prisma.catalogoTrabajo.findMany({ orderBy: [{ categoria: "asc" }, { orden: "asc" }] }),
  ]);
  if (!orden) notFound();

  const fotosPorCategoria = (categoria: CategoriaTrabajo) => {
    const tipos = categoriaToPiezas(categoria);
    return orden.archivos
      .filter((a) => tipos.includes(a.piezaTipo as TipoPieza))
      .map((a) => ({
        id: a.id,
        url: a.url,
        tipo: a.tipo as TipoArchivo,
        duracionSeg: a.duracionSeg,
      }));
  };

  const notas: Record<CategoriaTrabajo, string[]> = {
    BLOCK: [],
    CIGUENAL: [],
    ARBOL_LEVAS: [],
    TAPA_CILINDRO: [],
    VARIOS: [],
  };
  for (const m of orden.mediciones) {
    const texto = m.observacion?.trim();
    if (!texto) continue;
    const cat = piezaToCategoria(m.piezaTipo as TipoPieza);
    if (!cat) continue;
    notas[cat].push(`${PIEZA_LABEL[m.piezaTipo as TipoPieza]}: ${texto}`);
  }

  return (
    <PresupuestoClient
      numero={orden.numero}
      estado={orden.estado as EstadoOrden}
      from={from}
      cliente={orden.cliente.nombre}
      motor={motorTexto(orden.motorMarca, orden.motorModelo)}
      catalogo={catalogo.map((c) => ({
        id: c.id,
        categoria: c.categoria,
        descripcion: c.descripcion,
        precioSugerido: Number(c.precioSugerido),
      }))}
      trabajos={orden.trabajos.map((t) => ({
        id: t.id,
        categoria: t.categoria,
        descripcion: t.descripcion,
        precio: Number(t.precio),
        tildado: t.tildado,
        esLibre: t.esLibre,
      }))}
      fotos={{
        BLOCK: fotosPorCategoria("BLOCK"),
        CIGUENAL: fotosPorCategoria("CIGUENAL"),
        ARBOL_LEVAS: fotosPorCategoria("ARBOL_LEVAS"),
        TAPA_CILINDRO: fotosPorCategoria("TAPA_CILINDRO"),
        VARIOS: fotosPorCategoria("VARIOS"),
      }}
      notas={notas}
    />
  );
}
