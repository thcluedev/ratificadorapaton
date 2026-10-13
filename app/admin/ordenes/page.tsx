import { prisma } from "@/lib/prisma";
import { motorConBlock, motorTexto } from "@/lib/labels";
import type { EstadoOrden } from "@/lib/types";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { OrdenesList } from "@/components/OrdenesList";

export const dynamic = "force-dynamic";

const ORDEN_ESTADO: Record<EstadoOrden, number> = {
  MEDIDA: 0,
  PENDIENTE_MEDICION: 1,
  EN_MEDICION: 2,
  PRESUPUESTADA: 3,
  ENTREGADA: 4,
};

function prioridad(estado: EstadoOrden) {
  return ORDEN_ESTADO[estado];
}

export default async function OrdenesPage() {
  const ordenes = await prisma.orden.findMany({
    where: { estado: { not: "ENTREGADA" } },
    include: { cliente: true },
  });

  const filas = [...ordenes]
    .sort((a, b) => {
      const pa = prioridad(a.estado as EstadoOrden);
      const pb = prioridad(b.estado as EstadoOrden);
      if (pa !== pb) return pa - pb;
      return b.numero - a.numero;
    })
    .map((o) => ({
      numero: o.numero,
      cliente: o.cliente.nombre,
      motor: motorConBlock(o.numeroBlock, motorTexto(o.motorMarca, o.motorModelo)),
      estado: o.estado as EstadoOrden,
    }));

  return (
    <Screen header={<Header title="Órdenes en proceso" context="Administrador" atrasHref="/admin" />}>
      <OrdenesList ordenes={filas} />
    </Screen>
  );
}
