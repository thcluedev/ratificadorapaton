import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatFecha, labelPieza, motorTexto } from "@/lib/labels";
import { DetalleOrdenClient } from "./detalle-client";

export default async function DetalleOrdenPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const numero = Number((await params).numero);
  const orden = await prisma.orden.findUnique({
    where: { numero },
    include: {
      cliente: true,
      piezas: true,
      archivos: true,
      mensajes: {
        orderBy: { creadoEn: "asc" },
        include: { autor: { select: { nombre: true } } },
      },
    },
  });
  if (!orden) notFound();

  const mensajes = orden.mensajes.map((m) => ({
    id: m.id,
    tipo: m.tipo,
    cuerpo: m.cuerpo,
    autor: m.autor?.nombre ?? null,
    creadoEn: formatFecha(m.creadoEn),
  }));

  return (
    <DetalleOrdenClient
      numero={orden.numero}
      estado={orden.estado}
      cliente={orden.cliente.nombre}
      telefono={orden.cliente.telefono}
      motor={motorTexto(orden.motorMarca, orden.motorModelo)}
      numeroBlock={orden.numeroBlock}
      ingreso={formatFecha(orden.creadaEn)}
      piezas={orden.piezas.map((p) => labelPieza(p.tipo, p.etiquetaLibre))}
      fotos={orden.archivos.filter((a) => a.tipo === "FOTO").length}
      videos={orden.archivos.filter((a) => a.tipo === "VIDEO").length}
      mensajes={mensajes}
    />
  );
}
