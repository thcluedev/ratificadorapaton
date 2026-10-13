import type { EstadoOrden } from "@/lib/types";

export type OrigenNav = "ordenes" | "presupuestos" | "detalle";

export function parseOrigen(value?: string | string[]): OrigenNav {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === "presupuestos" || v === "detalle") return v;
  return "ordenes";
}

export function presupuestoGenerado(estado: EstadoOrden) {
  return estado === "PRESUPUESTADA" || estado === "ENTREGADA";
}

export function hrefOrigen(numero: number, from: OrigenNav) {
  if (from === "presupuestos") return "/admin/presupuestos";
  if (from === "detalle") return `/admin/orden/${numero}`;
  return "/admin/ordenes";
}

export function hrefPresupuesto(numero: number, from: OrigenNav) {
  return `/admin/orden/${numero}/presupuesto?from=${from}`;
}

export function hrefComprobante(numero: number, from: OrigenNav) {
  return `/admin/orden/${numero}/comprobante?from=${from}`;
}
