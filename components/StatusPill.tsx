import type { EstadoOrden } from "@/lib/types";
import { ESTADO_LABEL } from "@/lib/labels";

export function StatusPill({
  estado,
  filled = false,
}: {
  estado: EstadoOrden;
  filled?: boolean;
}) {
  const accent = filled || estado === "MEDIDA";
  return (
    <span
      className={`inline-flex min-h-[40px] items-center rounded-[10px] border-[3px] px-3 text-[18px] font-bold leading-none ${
        accent ? "border-acento bg-acento text-fondo" : "border-tinta bg-fondo text-tinta"
      }`}
    >
      {ESTADO_LABEL[estado]}
    </span>
  );
}
