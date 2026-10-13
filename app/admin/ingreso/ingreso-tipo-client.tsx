"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";

export function IngresosTipoClient() {
  return (
    <Screen header={<Header title="Ingresos" context="Administrador" atrasHref="/admin" />}>
      <div className="mx-auto flex max-w-[880px] flex-col gap-6">
        <p className="text-[22px] text-gris">Elegí qué tipo de ingreso vas a cargar.</p>
        <div className="grid grid-cols-2 gap-6">
          <Link
            href="/admin/ingreso/datos?tipo=completo"
            className="flex min-h-[220px] flex-col items-start justify-end rounded-[10px] border-[3px] border-tinta p-8"
          >
            <div className="text-[32px] font-bold leading-none">Ingreso de motor completo</div>
            <div className="mt-4 text-[20px] text-gris">Trajo el motor armado o desarmado completo</div>
          </Link>
          <Link
            href="/admin/ingreso/datos?tipo=piezas"
            className="flex min-h-[220px] flex-col items-start justify-end rounded-[10px] border-[3px] border-tinta p-8"
          >
            <div className="text-[32px] font-bold leading-none">Ingreso de piezas</div>
            <div className="mt-4 text-[20px] text-gris">Solo algunas piezas sueltas</div>
          </Link>
        </div>
      </div>
    </Screen>
  );
}
