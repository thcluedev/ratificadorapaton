import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatFechaCorta, motorTexto } from "@/lib/labels";
import { parseOrigen } from "@/lib/nav";
import type { EstadoOrden } from "@/lib/types";
import { ComprobanteClient } from "./comprobante-client";

export default async function ComprobantePage({
  params,
  searchParams,
}: {
  params: Promise<{ numero: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const numero = Number((await params).numero);
  const from = parseOrigen((await searchParams).from);
  const orden = await prisma.orden.findUnique({
    where: { numero },
    include: { cliente: true, trabajos: true },
  });
  if (!orden) notFound();

  const tildados = orden.trabajos
    .filter((t) => t.tildado)
    .map((t) => ({
      categoria: t.categoria,
      descripcion: t.descripcion,
      precio: Number(t.precio),
    }));

  return (
    <ComprobanteClient
      numero={orden.numero}
      estado={orden.estado as EstadoOrden}
      from={from}
      cliente={orden.cliente.nombre}
      motor={motorTexto(orden.motorMarca, orden.motorModelo)}
      fecha={formatFechaCorta(orden.actualizadaEn)}
      trabajos={tildados}
    />
  );
}
