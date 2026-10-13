import type { DetalleNotaCantidad } from "@/components/MedicionNotaCantidad";

/** Valor único para el input de cantidad (compat. datos viejos con nº + texto). */
export function cantidadComoTexto(det: DetalleNotaCantidad): string {
  const n = det.cantidadNumero.trim();
  const t = det.cantidadTexto.trim();
  if (n && t) return `${n} (${t})`;
  return n || t;
}

/** Texto corto para encabezados y chips. */
export function resumenCantidad(det: DetalleNotaCantidad): string | null {
  const texto = cantidadComoTexto(det);
  return texto || null;
}

export function detalleCantidadDesdeInput(valor: string): Pick<
  DetalleNotaCantidad,
  "cantidadActiva" | "cantidadNumero" | "cantidadTexto"
> {
  const v = valor.trim();
  return {
    cantidadActiva: v.length > 0,
    cantidadNumero: "",
    cantidadTexto: v,
  };
}
