"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TipoPieza } from "@/lib/types";
import { crearOrdenDesdeBorrador } from "@/app/actions/ordenes";
import { ingresoDatosHref, type BorradorIngreso } from "@/lib/ingreso";
import { PIEZA_LABEL, PIEZAS_CHECKLIST } from "@/lib/labels";
import { ActionBar } from "@/components/ActionBar";
import { BigButton } from "@/components/BigButton";
import { CheckRow } from "@/components/CheckRow";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";

export function PiezasClient({ borrador }: { borrador: BorradorIngreso }) {
  const router = useRouter();
  const [marcadas, setMarcadas] = useState<TipoPieza[]>(
    borrador.motorCompleto ? [...PIEZAS_CHECKLIST] : [],
  );
  const [otra, setOtra] = useState("");
  const [mostrarOtra, setMostrarOtra] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const total = PIEZAS_CHECKLIST.length + (mostrarOtra ? 1 : 0);
  const tildadas = marcadas.length + (mostrarOtra && otra.trim() ? 1 : 0);

  function toggle(tipo: TipoPieza) {
    setMarcadas((prev) => (prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]));
  }

  function confirmar() {
    setError("");
    const piezas: { tipo: TipoPieza; etiquetaLibre?: string }[] = marcadas.map((tipo) => ({ tipo }));
    if (mostrarOtra && otra.trim()) {
      piezas.push({ tipo: "OTRA", etiquetaLibre: otra.trim() });
    }
    if (piezas.length === 0) {
      setError("Marcá por lo menos una pieza.");
      return;
    }
    startTransition(async () => {
      const res = await crearOrdenDesdeBorrador(piezas);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <Screen
      header={
        <Header
          title="Checklist de piezas"
          context={borrador.motorCompleto ? "Motor completo" : "Piezas sueltas"}
          atrasHref={ingresoDatosHref(borrador.motorCompleto)}
        />
      }
      footer={
        <ActionBar
          left={
            <BigButton
              variant="secondary"
              onClick={() => router.push(ingresoDatosHref(borrador.motorCompleto))}
            >
              Atrás
            </BigButton>
          }
          right={
            <BigButton pending={pending} onClick={confirmar}>
              Confirmar ingreso
            </BigButton>
          }
        />
      }
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="text-[28px] font-bold">¿Qué piezas trajo?</div>
        <div className="text-right text-[20px] font-bold uppercase text-gris">
          Block {borrador.numeroBlock} · {borrador.nombre} · {borrador.motor}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {PIEZAS_CHECKLIST.map((tipo) => (
          <CheckRow
            key={tipo}
            checked={marcadas.includes(tipo)}
            label={PIEZA_LABEL[tipo]}
            onToggle={() => toggle(tipo)}
          />
        ))}
        <div className="flex flex-col gap-2">
          <CheckRow
            dashed
            checked={mostrarOtra}
            label="+ Otra"
            onToggle={() => setMostrarOtra((v) => !v)}
          />
          {mostrarOtra ? (
            <TextField
              value={otra}
              onChange={(e) => setOtra(e.target.value)}
              placeholder="¿Qué pieza es?"
            />
          ) : null}
        </div>
      </div>
      <p className="mt-4 text-[20px] text-gris">
        {tildadas} {tildadas === 1 ? "tildada" : "tildadas"} de {total}.
      </p>
      {error ? <p className="mt-4 text-[22px] font-bold">{error}</p> : null}
    </Screen>
  );
}
