"use client";

import { useRouter } from "next/navigation";
import type { EstadoOrden } from "@/lib/types";
import { ActionBar } from "@/components/ActionBar";
import { BigButton } from "@/components/BigButton";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { OrdenHistorial, type MensajeHistorialUI } from "@/components/OrdenHistorial";
import { StatusPill } from "@/components/StatusPill";

export function DetalleOrdenClient({
  numero,
  estado,
  cliente,
  telefono,
  motor,
  numeroBlock,
  ingreso,
  piezas,
  fotos,
  videos,
  mensajes,
}: {
  numero: number;
  estado: EstadoOrden;
  cliente: string;
  telefono: string;
  motor: string;
  numeroBlock: string;
  ingreso: string;
  piezas: string[];
  fotos: number;
  videos: number;
  mensajes: MensajeHistorialUI[];
}) {
  const router = useRouter();
  const puedePresupuesto = estado === "MEDIDA" || estado === "PRESUPUESTADA";

  return (
    <Screen
      header={
        <Header
          title={`Orden ${numero}`}
          context={<StatusPill estado={estado} />}
          atrasHref="/admin/ordenes"
        />
      }
      footer={
        <ActionBar
          left={
            <BigButton variant="secondary" onClick={() => router.push("/admin/ordenes")}>
              Volver
            </BigButton>
          }
          right={
            puedePresupuesto ? (
              <BigButton
                onClick={() =>
                  router.push(
                    estado === "PRESUPUESTADA"
                      ? `/admin/orden/${numero}/comprobante?from=detalle`
                      : `/admin/orden/${numero}/presupuesto?from=detalle`,
                  )
                }
              >
                {estado === "PRESUPUESTADA" ? "Ver presupuesto" : "Armar presupuesto"}
              </BigButton>
            ) : null
          }
        />
      }
    >
      <div className="mx-auto grid max-w-[900px] grid-cols-2 gap-x-10 gap-y-6 text-[22px]">
        <div>
          <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">Cliente</div>
          <div className="mt-1 font-bold">{cliente}</div>
          <div className="text-gris">{telefono}</div>
        </div>
        <div>
          <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">Nº de block</div>
          <div className="mt-1 font-bold">{numeroBlock || "—"}</div>
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
          <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">Material</div>
          <div className="mt-1 font-bold">
            {fotos} {fotos === 1 ? "foto" : "fotos"}
            {videos > 0 ? ` · ${videos} ${videos === 1 ? "video" : "videos"}` : ""}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">Piezas</div>
          <div className="mt-1 font-bold">{piezas.join(", ")}</div>
        </div>
        {!puedePresupuesto ? (
          <p className="col-span-2 text-[22px] text-gris">
            Todavía no se puede armar el presupuesto. Falta que midan el motor.
          </p>
        ) : null}
        <OrdenHistorial numero={numero} mensajes={mensajes} />
      </div>
    </Screen>
  );
}
