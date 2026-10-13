import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { leerBorradorIngreso } from "@/app/actions/ordenes";
import { IngresoClient } from "../ingreso-client";

export default async function IngresoDatosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  if (tipo !== "completo" && tipo !== "piezas") {
    redirect("/admin/ingreso");
  }
  const motorCompleto = tipo === "completo";

  const [clientes, borrador] = await Promise.all([
    prisma.cliente.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, telefono: true },
    }),
    leerBorradorIngreso(),
  ]);

  return (
    <IngresoClient
      clientes={clientes}
      borrador={borrador?.motorCompleto === motorCompleto ? borrador : null}
      motorCompleto={motorCompleto}
    />
  );
}
