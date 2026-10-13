"use client";

import { TextField } from "@/components/TextField";
import { cantidadComoTexto } from "@/lib/medicion-resumen";

export type DetalleNotaCantidad = {
  nota: string;
  cantidadActiva: boolean;
  cantidadNumero: string;
  cantidadTexto: string;
};

export function MedicionNotaCantidad({
  detalle,
  onNotaChange,
  onNotaBlur,
  onCantidadChange,
  onCantidadBlur,
  notaPlaceholder = "Nota",
  nivel = "pieza",
}: {
  detalle: DetalleNotaCantidad;
  onNotaChange: (valor: string) => void;
  onNotaBlur?: () => void;
  onCantidadChange: (valor: string) => void;
  onCantidadBlur?: () => void;
  notaPlaceholder?: string;
  /** pieza = bloque grande; item = ítem dentro de la ficha */
  nivel?: "pieza" | "item";
}) {
  const esPieza = nivel === "pieza";
  const inputClass = esPieza ? "min-h-[56px] text-[22px]" : "min-h-[48px] text-[18px]";
  const cantidadValor = cantidadComoTexto(detalle);

  return (
    <div className={`flex flex-col ${esPieza ? "gap-3" : "mt-2 gap-2"}`}>
      <div>
        {esPieza ? (
          <p className="mb-1 text-[16px] font-bold uppercase tracking-wide text-gris">Nota</p>
        ) : null}
        <TextField
          value={detalle.nota}
          onChange={(e) => onNotaChange(e.target.value)}
          onBlur={onNotaBlur}
          placeholder={notaPlaceholder}
          className={inputClass}
        />
      </div>
      <div>
        {esPieza ? (
          <p className="mb-1 text-[16px] font-bold uppercase tracking-wide text-gris">Cantidad</p>
        ) : null}
        <TextField
          value={cantidadValor}
          onChange={(e) => onCantidadChange(e.target.value)}
          onBlur={onCantidadBlur}
          placeholder="Cantidad"
          className={inputClass}
        />
      </div>
    </div>
  );
}
