"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agregarNotaOrden } from "@/app/actions/historial";
import { BigButton } from "@/components/BigButton";
import { TextArea } from "@/components/TextField";

export type MensajeHistorialUI = {
  id: string;
  tipo: "SISTEMA" | "NOTA";
  cuerpo: string;
  autor: string | null;
  creadoEn: string;
};

export function OrdenHistorial({
  numero,
  mensajes,
}: {
  numero: number;
  mensajes: MensajeHistorialUI[];
}) {
  const router = useRouter();
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function enviarNota() {
    setError("");
    startTransition(async () => {
      const res = await agregarNotaOrden(numero, nota);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setNota("");
      router.refresh();
    });
  }

  return (
    <section className="col-span-2 mt-4 border-t-[3px] border-tinta pt-6">
      <div className="mb-4 text-[18px] font-bold uppercase tracking-[0.08em] text-gris">Historial</div>

      <div className="mb-6 max-h-[320px] overflow-y-auto rounded-[10px] border-[3px] border-tinta bg-fondo p-4">
        {mensajes.length === 0 ? (
          <p className="text-[20px] text-gris">Todavía no hay movimientos en esta orden.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {mensajes.map((m) => (
              <li key={m.id} className="border-b-[2px] border-tinta/20 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[18px] font-bold">
                    {m.autor ?? "Sistema"}
                    {m.tipo === "NOTA" ? (
                      <span className="ml-2 rounded-[6px] border-[2px] border-acento px-2 py-0.5 text-[14px] font-bold uppercase text-acento">
                        Nota
                      </span>
                    ) : null}
                  </span>
                  <time className="text-[16px] text-gris">{m.creadoEn}</time>
                </div>
                <p className="mt-2 text-[20px] leading-snug">{m.cuerpo}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-2 text-[18px] font-bold uppercase tracking-[0.08em] text-gris">
          Agregar nota
        </div>
        <TextArea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Comentario interno para el administrador…"
          rows={3}
          className="min-h-[96px]"
        />
        {error ? <p className="mt-2 text-[20px] font-bold">{error}</p> : null}
        <div className="mt-3 flex justify-end">
          <BigButton variant="secondary" pending={pending} onClick={enviarNota}>
            Guardar nota
          </BigButton>
        </div>
      </div>
    </section>
  );
}
