import type { TipoPieza } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { itemsFichaParaPieza } from "@/lib/ficha-piezas";

export async function initFichaOrden(
  ordenId: string,
  piezas: { tipo: TipoPieza; etiquetaLibre?: string | null }[],
) {
  const rows = piezas.flatMap((p) =>
    itemsFichaParaPieza(p.tipo, p.etiquetaLibre).map((item) => ({
      ordenId,
      piezaTipo: p.tipo,
      itemId: item.id,
      label: item.label,
    })),
  );
  if (rows.length === 0) return;
  await prisma.piezaFichaItem.createMany({ data: rows });
}
