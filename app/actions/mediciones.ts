"use server";

import { revalidatePath } from "next/cache";
import type { TipoPieza } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/auth";
import {
  historialArchivo,
  historialCambioEstado,
  historialNotaMedicion,
} from "@/lib/orden-historial";

async function requireOperario() {
  const sesion = await requireSesion("OPERARIO");
  if (!sesion) {
    return { error: "Tenés que entrar como operario." } as const;
  }
  return { sesion };
}

function revalidarMedicion(numero: number) {
  revalidatePath(`/operario/orden/${numero}`);
  revalidatePath("/operario");
  revalidatePath(`/admin/orden/${numero}`);
  revalidatePath(`/admin/orden/${numero}/presupuesto`);
}

async function ordenOperable(numero: number) {
  const orden = await prisma.orden.findUnique({ where: { numero } });
  if (!orden) return { error: "No encontramos esa orden." as const };
  if (orden.estado === "PRESUPUESTADA" || orden.estado === "ENTREGADA") {
    return { error: "Esta orden ya no se puede medir." as const };
  }
  return { orden };
}

export type PiezaMedicionInput = {
  observacion: string;
  cantidadActiva: boolean;
  cantidadNumero: string;
  cantidadTexto: string;
};

export type FichaItemMedicionInput = {
  marcado: boolean;
  nota: string;
  cantidadActiva: boolean;
  cantidadNumero: string;
  cantidadTexto: string;
};

function normalizarCantidad(activa: boolean, numero: string, texto: string) {
  const n = numero.trim();
  const t = texto.trim();
  const unificado = t || n;
  const hay = unificado.length > 0;
  return {
    cantidadActiva: hay,
    cantidadNumero: null,
    cantidadTexto: hay ? unificado : null,
  };
}

export async function guardarPiezaMedicion(
  numero: number,
  piezaTipo: TipoPieza,
  data: PiezaMedicionInput,
) {
  const auth = await requireOperario();
  if ("error" in auth) return auth;

  const check = await ordenOperable(numero);
  if ("error" in check) return check;
  const { orden } = check;

  const observacion = data.observacion.trim() || null;
  const cantidad = normalizarCantidad(
    data.cantidadActiva,
    data.cantidadNumero,
    data.cantidadTexto,
  );

  const existente = await prisma.medicion.findFirst({
    where: { ordenId: orden.id, piezaTipo },
    orderBy: { creadaEn: "desc" },
  });
  const antesNota = (existente?.observacion ?? "").trim();

  const hayDatos =
    observacion ||
    cantidad.cantidadActiva ||
    cantidad.cantidadNumero ||
    cantidad.cantidadTexto;

  if (existente) {
    await prisma.medicion.update({
      where: { id: existente.id },
      data: { observacion, ...cantidad },
    });
  } else if (hayDatos) {
    await prisma.medicion.create({
      data: {
        ordenId: orden.id,
        piezaTipo,
        observacion,
        ...cantidad,
        creadaPor: auth.sesion.userId,
      },
    });
  }

  if (observacion && observacion !== antesNota) {
    await historialNotaMedicion(
      orden.id,
      auth.sesion.userId,
      auth.sesion.nombre,
      piezaTipo,
    );
  }

  const estadoAntes = orden.estado;
  if (orden.estado === "PENDIENTE_MEDICION" && hayDatos) {
    await prisma.orden.update({
      where: { id: orden.id },
      data: { estado: "EN_MEDICION" },
    });
    await historialCambioEstado(
      orden.id,
      auth.sesion.userId,
      auth.sesion.nombre,
      estadoAntes,
      "EN_MEDICION",
    );
  }

  revalidarMedicion(numero);
  return { ok: true as const };
}

/** @deprecated Usar guardarPiezaMedicion */
export async function guardarNota(numero: number, piezaTipo: TipoPieza, observacion: string) {
  return guardarPiezaMedicion(numero, piezaTipo, {
    observacion,
    cantidadActiva: false,
    cantidadNumero: "",
    cantidadTexto: "",
  });
}

export async function guardarFichaItemDetalle(
  numero: number,
  piezaTipo: TipoPieza,
  itemId: string,
  data: FichaItemMedicionInput,
) {
  const auth = await requireOperario();
  if ("error" in auth) return auth;

  const check = await ordenOperable(numero);
  if ("error" in check) return check;
  const { orden } = check;

  const item = await prisma.piezaFichaItem.findFirst({
    where: { ordenId: orden.id, piezaTipo, itemId },
  });
  if (!item) return { error: "Ese ítem no corresponde a esta orden." };

  const cantidad = normalizarCantidad(
    data.cantidadActiva,
    data.cantidadNumero,
    data.cantidadTexto,
  );

  await prisma.piezaFichaItem.update({
    where: { id: item.id },
    data: {
      marcado: data.marcado,
      marcadoPor: data.marcado ? auth.sesion.userId : null,
      marcadoEn: data.marcado ? new Date() : null,
      nota: data.nota.trim() || null,
      ...cantidad,
    },
  });

  revalidarMedicion(numero);
  return { ok: true as const };
}

export async function terminarMedicion(numero: number) {
  const auth = await requireOperario();
  if ("error" in auth) return auth;

  const check = await ordenOperable(numero);
  if ("error" in check) return check;
  const { orden } = check;

  const estadoAntes = orden.estado;
  await prisma.orden.update({
    where: { id: orden.id },
    data: { estado: "MEDIDA" },
  });

  await historialCambioEstado(
    orden.id,
    auth.sesion.userId,
    auth.sesion.nombre,
    estadoAntes,
    "MEDIDA",
  );

  revalidatePath("/operario");
  revalidatePath(`/operario/orden/${numero}`);
  revalidatePath("/admin");
  revalidatePath("/admin/ordenes");
  revalidatePath(`/admin/orden/${numero}`);
  return { ok: true };
}

export async function borrarArchivo(archivoId: string, numero: number) {
  const auth = await requireOperario();
  if ("error" in auth) return auth;

  const archivo = await prisma.archivo.findUnique({ where: { id: archivoId } });
  if (!archivo) return { error: "Ese archivo ya no está." };

  await prisma.archivo.delete({ where: { id: archivoId } });

  await historialArchivo(
    archivo.ordenId,
    auth.sesion.userId,
    auth.sesion.nombre,
    archivo.piezaTipo,
    archivo.tipo,
    "elimino",
  );

  revalidatePath(`/operario/orden/${numero}`);
  revalidatePath("/operario");
  revalidatePath(`/admin/orden/${numero}`);
  revalidatePath(`/admin/orden/${numero}/presupuesto`);
  return { ok: true };
}
