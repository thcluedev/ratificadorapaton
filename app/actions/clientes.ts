"use server";

import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/auth";

export async function buscarClientes(q: string) {
  const sesion = await requireSesion("ADMIN");
  if (!sesion) return [];
  const texto = q.trim();
  if (!texto) {
    return prisma.cliente.findMany({ orderBy: { nombre: "asc" }, take: 8 });
  }
  return prisma.cliente.findMany({
    where: {
      OR: [
        { nombre: { contains: texto } },
        { telefono: { contains: texto } },
      ],
    },
    orderBy: { nombre: "asc" },
    take: 8,
  });
}
