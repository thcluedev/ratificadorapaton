"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CategoriaTrabajo, EstadoOrden } from "@/lib/types";
import {
  hrefOrigen,
  hrefPresupuesto,
  presupuestoGenerado,
  type OrigenNav,
} from "@/lib/nav";
import { marcarPresupuestada } from "@/app/actions/presupuestos";
import { CATEGORIA_LABEL, CATEGORIAS } from "@/lib/labels";
import { formatDinero, sumarTildados } from "@/lib/money";
import { ActionBar } from "@/components/ActionBar";
import { BigButton } from "@/components/BigButton";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";

type Item = {
  categoria: CategoriaTrabajo;
  descripcion: string;
  precio: number;
};

export function ComprobanteClient({
  numero,
  estado,
  from,
  cliente,
  motor,
  fecha,
  trabajos,
}: {
  numero: number;
  estado: EstadoOrden;
  from: OrigenNav;
  cliente: string;
  motor: string;
  fecha: string;
  trabajos: Item[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const total = sumarTildados(trabajos.map((t) => ({ ...t, tildado: true })));
  const yaGenerado = presupuestoGenerado(estado);
  const atrasHref = yaGenerado ? hrefOrigen(numero, from) : hrefPresupuesto(numero, from);

  function imprimir() {
    start(async () => {
      await marcarPresupuestada(numero);
      window.print();
    });
  }

  return (
    <Screen
      header={
        <Header
          title={`Presupuesto · Orden ${numero}`}
          context={fecha}
          atrasHref={atrasHref}
        />
      }
      footer={
        <ActionBar
          left={
            <BigButton
              variant="secondary"
              onClick={() =>
                router.push(yaGenerado ? hrefPresupuesto(numero, from) : atrasHref)
              }
            >
              {yaGenerado ? "Editar" : "Volver"}
            </BigButton>
          }
          right={
            <BigButton pending={pending} onClick={imprimir}>
              Imprimir
            </BigButton>
          }
        />
      }
    >
      <article className="mx-auto max-w-[800px]">
        <div className="print-only mb-6 border-b-[3px] border-tinta pb-4">
          <div className="text-[28px] font-bold">Rectificaciones Patón</div>
          <div className="text-[20px]">Orden {numero}</div>
        </div>
        <div className="flex items-start justify-between gap-4 border-b-[3px] border-tinta pb-4 text-[22px]">
          <div>
            <span className="font-bold">{cliente}</span>
            <span className="text-gris"> · {motor}</span>
          </div>
          <div className="shrink-0 text-gris">{fecha}</div>
        </div>

        {CATEGORIAS.map((cat) => {
          const items = trabajos.filter((t) => t.categoria === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat} className="mt-8">
              <div className="border-b-[3px] border-tinta pb-1 text-[18px] font-bold uppercase tracking-[0.08em] text-gris">
                {CATEGORIA_LABEL[cat]}
              </div>
              <div className="mt-2 flex flex-col">
                {items.map((t) => (
                  <div
                    key={`${t.categoria}-${t.descripcion}`}
                    className="flex min-h-[56px] items-center justify-between text-[22px]"
                  >
                    <span>{t.descripcion}</span>
                    <span className="font-bold">{formatDinero(t.precio)}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="mt-10 flex items-end justify-between border-t-[6px] border-tinta pt-4">
          <div className="text-[24px] font-bold uppercase">Total</div>
          <div className="text-[56px] font-bold leading-none">{formatDinero(total)}</div>
        </div>
      </article>
    </Screen>
  );
}
