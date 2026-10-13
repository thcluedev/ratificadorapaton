"use server";

import { redirect } from "next/navigation";
import type { Rol } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clearSesionCookie, setSesionCookie, verificarPin } from "@/lib/auth";

export async function listarUsuarios(rol: Rol) {
  return prisma.user.findMany({
    where: { rol, activo: true },
    select: { id: true, nombre: true, rol: true },
    orderBy: { nombre: "asc" },
  });
}

export async function ingresar(userId: string, pin: string) {
  if (!/^\d{4}$/.test(pin)) {
    return { error: "El PIN tiene que ser de 4 números." };
  }
  const user = await verificarPin(userId, pin);
  if (!user) {
    return { error: "PIN incorrecto. Probá de nuevo." };
  }
  await setSesionCookie({
    userId: user.id,
    nombre: user.nombre,
    rol: user.rol,
  });
  redirect(user.rol === "ADMIN" ? "/admin" : "/operario");
}

export async function salir() {
  await clearSesionCookie();
  redirect("/");
}
