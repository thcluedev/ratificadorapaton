"use server";

import { revalidatePath } from "next/cache";
import type { CategoriaTrabajo } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/auth";
import {
  historialCambioEstado,
  historialPrecioTrabajo,
  historialPresupuestoEntregado,
  historialTrabajoLibre,
  historialTrabajoTildado,
} from "@/lib/orden-historial";

async function requireAdmin() {
  const sesion = await requireSesion("ADMIN");
  if (!sesion) {
    return { error: "Tenés que entrar como administrador." } as const;
  }
  return { sesion };
}

function revalidarPresupuesto(numero: number) {
  revalidatePath(`/admin/orden/${numero}/presupuesto`);
  revalidatePath(`/admin/orden/${numero}/comprobante`);
  revalidatePath(`/admin/orden/${numero}`);
  revalidatePath("/admin/ordenes");
  revalidatePath("/admin/presupuestos");
  revalidatePath("/admin");
}

export async function tildarTrabajo(input: {
  numero: number;
  categoria: CategoriaTrabajo;
  descripcion: string;
  precioSugerido: number;
  tildado: boolean;
  trabajoId?: string;
}) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;

  const orden = await prisma.orden.findUnique({ where: { numero: input.numero } });
  if (!orden) return { error: "No encontramos esa orden." };

  if (input.trabajoId) {
    const trabajo = await prisma.trabajo.findUnique({ where: { id: input.trabajoId } });
    if (!trabajo) return { error: "No encontramos ese trabajo." };
    await prisma.trabajo.update({
      where: { id: input.trabajoId },
      data: { tildado: input.tildado },
    });
    await historialTrabajoTildado(
      orden.id,
      auth.sesion.userId,
      auth.sesion.nombre,
      trabajo.descripcion,
      input.tildado,
      input.tildado ? Number(trabajo.precio) : undefined,
    );
  } else if (input.tildado) {
    await prisma.trabajo.create({
      data: {
        ordenId: orden.id,
        categoria: input.categoria,
        descripcion: input.descripcion,
        precio: input.precioSugerido,
        tildado: true,
        esLibre: false,
      },
    });
    await historialTrabajoTildado(
      orden.id,
      auth.sesion.userId,
      auth.sesion.nombre,
      input.descripcion,
      true,
      input.precioSugerido,
    );
  }

  revalidarPresupuesto(input.numero);
  return { ok: true };
}

export async function cambiarPrecio(trabajoId: string, numero: number, precio: number) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  if (precio < 0) return { error: "El precio no puede ser negativo." };

  const trabajo = await prisma.trabajo.findUnique({ where: { id: trabajoId } });
  if (!trabajo) return { error: "No encontramos ese trabajo." };
  const antes = Number(trabajo.precio);

  await prisma.trabajo.update({
    where: { id: trabajoId },
    data: { precio, tildado: true },
  });

  if (antes !== precio) {
    await historialPrecioTrabajo(
      trabajo.ordenId,
      auth.sesion.userId,
      auth.sesion.nombre,
      trabajo.descripcion,
      antes,
      precio,
    );
  }

  revalidarPresupuesto(numero);
  return { ok: true };
}

export async function crearTrabajoYPrecio(input: {
  numero: number;
  categoria: CategoriaTrabajo;
  descripcion: string;
  precioSugerido: number;
  precio: number;
}) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;

  const orden = await prisma.orden.findUnique({ where: { numero: input.numero } });
  if (!orden) return { error: "No encontramos esa orden." };

  await prisma.trabajo.create({
    data: {
      ordenId: orden.id,
      categoria: input.categoria,
      descripcion: input.descripcion,
      precio: input.precio,
      tildado: true,
      esLibre: false,
    },
  });

  await historialTrabajoTildado(
    orden.id,
    auth.sesion.userId,
    auth.sesion.nombre,
    input.descripcion,
    true,
    input.precio,
  );

  revalidarPresupuesto(input.numero);
  return { ok: true };
}

export async function agregarTrabajoLibre(input: {
  numero: number;
  categoria: CategoriaTrabajo;
  descripcion: string;
  precio: number;
}) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const descripcion = input.descripcion.trim();
  if (!descripcion) return { error: "Escribí qué trabajo es." };

  const orden = await prisma.orden.findUnique({ where: { numero: input.numero } });
  if (!orden) return { error: "No encontramos esa orden." };

  await prisma.trabajo.create({
    data: {
      ordenId: orden.id,
      categoria: input.categoria,
      descripcion,
      precio: input.precio,
      tildado: true,
      esLibre: true,
    },
  });

  await historialTrabajoLibre(
    orden.id,
    auth.sesion.userId,
    auth.sesion.nombre,
    descripcion,
    input.precio,
  );

  revalidarPresupuesto(input.numero);
  return { ok: true };
}

export async function marcarPresupuestada(numero: number) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;

  const orden = await prisma.orden.findUnique({ where: { numero } });
  if (!orden) return { error: "No encontramos esa orden." };

  if (orden.estado === "MEDIDA" || orden.estado === "PRESUPUESTADA") {
    const estadoAntes = orden.estado;
    await prisma.orden.update({
      where: { id: orden.id },
      data: { estado: "PRESUPUESTADA" },
    });
    if (estadoAntes !== "PRESUPUESTADA") {
      await historialPresupuestoEntregado(orden.id, auth.sesion.userId, auth.sesion.nombre);
      await historialCambioEstado(
        orden.id,
        auth.sesion.userId,
        auth.sesion.nombre,
        estadoAntes,
        "PRESUPUESTADA",
      );
    }
  }

  revalidarPresupuesto(numero);
  return { ok: true };
}
