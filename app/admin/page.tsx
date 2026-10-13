import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSesion } from "@/lib/auth";
import { salir } from "@/app/actions/auth";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const sesion = await getSesion();
  const [abiertas, medidas, presupuestadas] = await Promise.all([
    prisma.orden.count({ where: { estado: { not: "ENTREGADA" } } }),
    prisma.orden.count({ where: { estado: "MEDIDA" } }),
    prisma.orden.count({ where: { estado: { in: ["PRESUPUESTADA", "ENTREGADA"] } } }),
  ]);

  return (
    <Screen
      header={
        <Header
          title="Rectificaciones Patón"
          context={
            <form action={salir}>
              <button type="submit" className="text-[20px] font-bold text-tinta">
                Salir
              </button>
            </form>
          }
        />
      }
    >
      <div className="flex h-full min-h-[520px] flex-col justify-center">
        <div className="mb-4 text-[20px] text-gris">Hola, {sesion?.nombre}</div>
        <div className="grid grid-cols-2 gap-6">
          <Link
            href="/admin/ingreso"
            className="flex min-h-[280px] flex-col items-start justify-end rounded-[10px] border-[3px] border-tinta p-8"
          >
            <div className="text-[32px] font-bold leading-none">Ingresos</div>
            <div className="mt-4 text-[20px] text-gris">Motor completo o piezas sueltas</div>
          </Link>
          <Link
            href="/admin/ordenes"
            className="flex min-h-[280px] flex-col items-start justify-end rounded-[10px] border-[3px] border-tinta p-8"
          >
            <div className="text-[32px] font-bold leading-none">Órdenes en proceso</div>
            <div className="mt-4 text-[20px] text-gris">
              {abiertas} {abiertas === 1 ? "abierta" : "abiertas"} · {medidas} ya{" "}
              {medidas === 1 ? "medida" : "medidas"}
            </div>
          </Link>
          <Link
            href="/admin/presupuestos"
            className="flex min-h-[280px] flex-col items-start justify-end rounded-[10px] border-[3px] border-tinta p-8"
          >
            <div className="text-[32px] font-bold leading-none">Presupuestos</div>
            <div className="mt-4 text-[20px] text-gris">
              {presupuestadas} ya {presupuestadas === 1 ? "generado" : "generados"}
            </div>
          </Link>
        </div>
      </div>
    </Screen>
  );
}
