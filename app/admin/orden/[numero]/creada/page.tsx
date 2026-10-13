import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatFecha, labelPieza, motorTexto } from "@/lib/labels";
import { OrdenCreadaClient } from "./creada-client";

export default async function OrdenCreadaPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero: raw } = await params;
  const numero = Number(raw);
  const orden = await prisma.orden.findUnique({
    where: { numero },
    include: { cliente: true, piezas: true },
  });
  if (!orden) notFound();

  return (
    <OrdenCreadaClient
      numero={orden.numero}
      estado={orden.estado}
      cliente={orden.cliente.nombre}
      motor={motorTexto(orden.motorMarca, orden.motorModelo)}
      numeroBlock={orden.numeroBlock}
      ingreso={formatFecha(orden.creadaEn)}
      piezas={orden.piezas.map((p) => labelPieza(p.tipo, p.etiquetaLibre))}
    />
  );
}
