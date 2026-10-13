import type { EstadoOrden, TipoArchivo, TipoMensajeOrden, TipoPieza } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ESTADO_LABEL, PIEZA_LABEL } from "@/lib/labels";
import { formatDinero } from "@/lib/money";

export async function registrarMensajeOrden(
  ordenId: string,
  data: {
    autorId?: string | null;
    tipo: TipoMensajeOrden;
    cuerpo: string;
    meta?: Record<string, unknown>;
  },
) {
  const cuerpo = data.cuerpo.trim();
  if (!cuerpo) return;
  await prisma.mensajeOrden.create({
    data: {
      ordenId,
      autorId: data.autorId ?? null,
      tipo: data.tipo,
      cuerpo,
      meta: data.meta ? JSON.stringify(data.meta) : null,
    },
  });
}

export function etiquetaEstado(estado: EstadoOrden) {
  return ESTADO_LABEL[estado];
}

export function etiquetaPieza(tipo: TipoPieza) {
  return PIEZA_LABEL[tipo] ?? tipo;
}

export async function historialOrdenCreada(
  ordenId: string,
  autorId: string,
  autorNombre: string,
  numeroBlock: string,
  motorCompleto: boolean,
) {
  const tipo = motorCompleto ? "motor completo" : "piezas sueltas";
  await registrarMensajeOrden(ordenId, {
    autorId,
    tipo: "SISTEMA",
    cuerpo: `${autorNombre} creó la orden · Block ${numeroBlock} · Ingreso de ${tipo}`,
    meta: { evento: "orden_creada" },
  });
}

export async function historialCambioEstado(
  ordenId: string,
  autorId: string | null,
  autorNombre: string,
  antes: EstadoOrden,
  despues: EstadoOrden,
) {
  if (antes === despues) return;
  await registrarMensajeOrden(ordenId, {
    autorId,
    tipo: "SISTEMA",
    cuerpo: `${autorNombre}: estado ${etiquetaEstado(antes)} → ${etiquetaEstado(despues)}`,
    meta: { evento: "estado", antes, despues },
  });
}

export async function historialArchivo(
  ordenId: string,
  autorId: string,
  autorNombre: string,
  piezaTipo: TipoPieza,
  tipo: TipoArchivo,
  accion: "subio" | "elimino",
) {
  const pieza = etiquetaPieza(piezaTipo);
  const medio = tipo === "FOTO" ? "foto" : "video";
  const verbo = accion === "subio" ? "subió" : "eliminó";
  await registrarMensajeOrden(ordenId, {
    autorId,
    tipo: "SISTEMA",
    cuerpo: `${autorNombre} ${verbo} ${medio} · ${pieza}`,
    meta: { evento: "archivo", accion, piezaTipo, tipo },
  });
}

export async function historialNotaMedicion(
  ordenId: string,
  autorId: string,
  autorNombre: string,
  piezaTipo: TipoPieza,
) {
  await registrarMensajeOrden(ordenId, {
    autorId,
    tipo: "SISTEMA",
    cuerpo: `${autorNombre} actualizó notas · ${etiquetaPieza(piezaTipo)}`,
    meta: { evento: "nota_medicion", piezaTipo },
  });
}

export async function historialTrabajoTildado(
  ordenId: string,
  autorId: string,
  autorNombre: string,
  descripcion: string,
  tildado: boolean,
  precio?: number,
) {
  const cuerpo = tildado
    ? `${autorNombre} agregó al presupuesto: ${descripcion}${precio != null ? ` · ${formatDinero(precio)}` : ""}`
    : `${autorNombre} quitó del presupuesto: ${descripcion}`;
  await registrarMensajeOrden(ordenId, {
    autorId,
    tipo: "SISTEMA",
    cuerpo,
    meta: { evento: "trabajo_tildado", tildado, descripcion },
  });
}

export async function historialPrecioTrabajo(
  ordenId: string,
  autorId: string,
  autorNombre: string,
  descripcion: string,
  antes: number,
  despues: number,
) {
  await registrarMensajeOrden(ordenId, {
    autorId,
    tipo: "SISTEMA",
    cuerpo: `${autorNombre} cambió precio · ${descripcion}: ${formatDinero(antes)} → ${formatDinero(despues)}`,
    meta: { evento: "precio", descripcion, antes, despues },
  });
}

export async function historialTrabajoLibre(
  ordenId: string,
  autorId: string,
  autorNombre: string,
  descripcion: string,
  precio: number,
) {
  await registrarMensajeOrden(ordenId, {
    autorId,
    tipo: "SISTEMA",
    cuerpo: `${autorNombre} agregó trabajo libre: ${descripcion} · ${formatDinero(precio)}`,
    meta: { evento: "trabajo_libre", descripcion, precio },
  });
}

export async function historialPresupuestoEntregado(
  ordenId: string,
  autorId: string,
  autorNombre: string,
) {
  await registrarMensajeOrden(ordenId, {
    autorId,
    tipo: "SISTEMA",
    cuerpo: `${autorNombre} entregó el presupuesto al cliente`,
    meta: { evento: "presupuesto_entregado" },
  });
}
