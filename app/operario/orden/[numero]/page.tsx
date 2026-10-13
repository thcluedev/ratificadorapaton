import { notFound } from "next/navigation";
import type { Prisma, TipoPieza } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { initFichaOrden } from "@/lib/init-ficha-orden";
import { labelPieza, motorTexto } from "@/lib/labels";
import { MedicionClient } from "./medicion-client";

const ordenMedicionInclude = {
  cliente: true,
  piezas: true,
  archivos: true,
  mediciones: true,
  fichaItems: true,
} as const satisfies Prisma.OrdenInclude;

function ordenarFichaItems<T extends { piezaTipo: TipoPieza; label: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => a.piezaTipo.localeCompare(b.piezaTipo) || a.label.localeCompare(b.label, "es"),
  );
}

export default async function MedicionPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const numero = Number((await params).numero);
  const orden = await prisma.orden.findUnique({
    where: { numero },
    include: ordenMedicionInclude,
  });
  if (!orden) notFound();

  let debeRefetchFicha = false;
  for (const p of orden.piezas) {
    const count = orden.fichaItems.filter((f) => f.piezaTipo === p.tipo).length;
    if (count === 0) {
      await initFichaOrden(orden.id, [{ tipo: p.tipo, etiquetaLibre: p.etiquetaLibre }]);
      debeRefetchFicha = true;
    }
  }

  const fichaRows = ordenarFichaItems(
    debeRefetchFicha
      ? ((
          await prisma.orden.findUnique({
            where: { id: orden.id },
            include: { fichaItems: true },
          })
        )?.fichaItems ?? [])
      : orden.fichaItems,
  );

  const tipos = new Map<TipoPieza, string>();
  for (const p of orden.piezas) {
    tipos.set(p.tipo, labelPieza(p.tipo, p.etiquetaLibre));
  }

  const piezas = Array.from(tipos.entries()).map(([tipo, label]) => {
    const archivosPieza = orden.archivos.filter((a) => a.piezaTipo === tipo);
    const mapArchivo = (a: (typeof archivosPieza)[number]) => ({
      id: a.id,
      url: a.url,
      tipo: a.tipo,
      duracionSeg: a.duracionSeg,
    });
    const archivos = archivosPieza.filter((a) => !a.fichaItemId).map(mapArchivo);
    const medicion =
      orden.mediciones
        .filter((m) => m.piezaTipo === tipo)
        .sort((a, b) => b.creadaEn.getTime() - a.creadaEn.getTime())[0] ?? null;
    const fichaItems = fichaRows
      .filter((f) => f.piezaTipo === tipo)
      .map((f) => ({
        itemId: f.itemId,
        label: f.label,
        marcado: f.marcado,
        nota: f.nota ?? "",
        cantidadActiva: f.cantidadActiva,
        cantidadNumero: f.cantidadNumero ?? "",
        cantidadTexto: f.cantidadTexto ?? "",
        archivos: archivosPieza
          .filter((a) => a.fichaItemId === f.itemId)
          .map(mapArchivo),
      }));
    return {
      tipo,
      label,
      archivos,
      nota: medicion?.observacion ?? "",
      cantidadActiva: medicion?.cantidadActiva ?? false,
      cantidadNumero: medicion?.cantidadNumero ?? "",
      cantidadTexto: medicion?.cantidadTexto ?? "",
      fichaItems,
    };
  });

  return (
    <MedicionClient
      numero={orden.numero}
      motor={motorTexto(orden.motorMarca, orden.motorModelo)}
      numeroBlock={orden.numeroBlock}
      cliente={orden.cliente.nombre}
      estado={orden.estado}
      piezas={piezas}
    />
  );
}
