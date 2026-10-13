"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { EstadoOrden } from "@/lib/types";
import { OrderRow } from "@/components/OrderRow";
import { TextField } from "@/components/TextField";

type Fila = {
  numero: number;
  cliente: string;
  motor: string;
  estado: EstadoOrden;
  fecha: string;
  fechaIso: string;
};

type Periodo = "todas" | "hoy" | "semana" | "mes";

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mes" },
];

function inicioHoy() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function enPeriodo(iso: string, periodo: Periodo) {
  if (periodo === "todas") return true;
  const d = new Date(iso);
  const hoy = inicioHoy();
  if (periodo === "hoy") return d >= hoy;
  if (periodo === "semana") {
    const desde = new Date(hoy);
    const dia = (hoy.getDay() + 6) % 7;
    desde.setDate(hoy.getDate() - dia);
    return d >= desde;
  }
  return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth();
}

export function PresupuestosList({ presupuestos }: { presupuestos: Fila[] }) {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<Periodo>("todas");
  const [q, setQ] = useState("");

  const filtradas = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return presupuestos.filter((p) => {
      if (!enPeriodo(p.fechaIso, periodo)) return false;
      if (!texto) return true;
      return (
        String(p.numero).includes(texto) ||
        p.cliente.toLowerCase().includes(texto) ||
        p.motor.toLowerCase().includes(texto)
      );
    });
  }, [presupuestos, periodo, q]);

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
      <div className="flex gap-3">
        {PERIODOS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriodo(p.id)}
            className={`min-h-[78px] flex-1 rounded-[10px] border-[3px] text-[22px] font-bold ${
              periodo === p.id ? "border-acento bg-acento text-fondo" : "border-tinta bg-fondo"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <TextField
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por cliente, motor o número"
        autoComplete="off"
      />
      {filtradas.length === 0 ? (
        <p className="text-[24px] text-gris">
          {presupuestos.length === 0
            ? "Todavía no hay presupuestos generados."
            : "Ninguno coincide con el filtro."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map((p) => (
            <OrderRow
              key={p.numero}
              numero={p.numero}
              top={p.cliente}
              title={p.motor}
              right={<span className="text-[20px] font-bold text-tinta">{p.fecha}</span>}
              onClick={() =>
                router.push(`/admin/orden/${p.numero}/comprobante?from=presupuestos`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
