import { Prisma } from "@prisma/client";

export function formatDinero(valor: Prisma.Decimal | number | string) {
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(n)) return "$ —";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function parseDinero(texto: string) {
  const limpio = texto.replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(limpio);
  return Number.isFinite(n) ? n : 0;
}

export function sumarTildados(
  trabajos: { tildado: boolean; precio: Prisma.Decimal | number | string }[],
) {
  return trabajos
    .filter((t) => t.tildado)
    .reduce((acc, t) => acc + Number(t.precio), 0);
}
