"use client";

import { useRouter } from "next/navigation";
import type { EstadoOrden } from "@/lib/types";
import { ActionBar } from "@/components/ActionBar";
import { BigButton } from "@/components/BigButton";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { StatusPill } from "@/components/StatusPill";

export function OrdenCreadaClient({
  numero,
  estado,
  cliente,
  motor,
  numeroBlock,
  ingreso,
  piezas,
}: {
  numero: number;
  estado: EstadoOrden;
  cliente: string;
  motor: string;
  numeroBlock: string;
  ingreso: string;
  piezas: string[];
}) {
  const router = useRouter();

  return (
    <Screen
      header={
        <Header
          title="Orden generada"
          context={<StatusPill estado={estado} />}
          atrasHref="/admin"
        />
      }
      footer={
        <ActionBar
          left={
            <BigButton variant="secondary" onClick={() => window.print()}>
              Imprimir orden
            </BigButton>
          }
          right={
            <BigButton onClick={() => router.push("/admin")}>Listo</BigButton>
          }
        />
      }
    >
      <div className="print-only mb-8 text-[22px] font-bold">
        Rectificaciones Patón · Orden {numero}
      </div>
      <div className="flex items-stretch gap-6">
        <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">
          Número de orden
        </div>
        <div className="flex min-h-[140px] flex-1 items-center justify-center rounded-[10px] border-[3px] border-tinta text-[88px] font-bold leading-none">
          {numero}
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-6 text-[22px]">
        <div>
          <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">Cliente</div>
          <div className="mt-1 font-bold">{cliente}</div>
        </div>
        <div>
          <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">Nº de block</div>
          <div className="mt-1 font-bold">{numeroBlock}</div>
        </div>
        <div>
          <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">Motor</div>
          <div className="mt-1 font-bold">{motor}</div>
        </div>
        <div>
          <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">Ingresó</div>
          <div className="mt-1 font-bold">{ingreso}</div>
        </div>
        <div>
          <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">Piezas</div>
          <div className="mt-1 font-bold">{piezas.join(", ")}</div>
        </div>
      </div>
    </Screen>
  );
}
