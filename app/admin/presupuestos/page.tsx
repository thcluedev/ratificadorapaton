import { prisma } from "@/lib/prisma";
import { formatFecha, motorTexto } from "@/lib/labels";
import type { EstadoOrden } from "@/lib/types";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { PresupuestosList } from "@/components/PresupuestosList";

export const dynamic = "force-dynamic";

export default async function PresupuestosPage() {
  const ordenes = await prisma.orden.findMany({
    where: { estado: { in: ["PRESUPUESTADA", "ENTREGADA"] } },
    include: { cliente: true },
    orderBy: { actualizadaEn: "desc" },
  });

  const filas = ordenes.map((o) => ({
    numero: o.numero,
    cliente: o.cliente.nombre,
    motor: motorTexto(o.motorMarca, o.motorModelo),
    estado: o.estado as EstadoOrden,
    fecha: formatFecha(o.actualizadaEn),
    fechaIso: o.actualizadaEn.toISOString(),
  }));

  return (
    <Screen header={<Header title="Presupuestos" context="Ya generados" atrasHref="/admin" />}>
      <PresupuestosList presupuestos={filas} />
    </Screen>
  );
}
