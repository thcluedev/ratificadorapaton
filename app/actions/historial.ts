"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/auth";
import { registrarMensajeOrden } from "@/lib/orden-historial";

export async function agregarNotaOrden(numero: number, texto: string) {
  const sesion = await requireSesion("ADMIN");
  if (!sesion) {
    return { error: "Tenés que entrar como administrador." } as const;
  }

  const cuerpo = texto.trim();
  if (!cuerpo) {
    return { error: "Escribí una nota." } as const;
  }

  const orden = await prisma.orden.findUnique({ where: { numero } });
  if (!orden) {
    return { error: "No encontramos esa orden." } as const;
  }

  await registrarMensajeOrden(orden.id, {
    autorId: sesion.userId,
    tipo: "NOTA",
    cuerpo,
  });

  revalidatePath(`/admin/orden/${numero}`);
  return { ok: true as const };
}
