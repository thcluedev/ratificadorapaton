"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { TipoPieza } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSesion } from "@/lib/auth";
import { siguienteNumeroOrden } from "@/lib/orden-numero";
import { COOKIE_BORRADOR, type BorradorIngreso } from "@/lib/ingreso";
import { historialOrdenCreada } from "@/lib/orden-historial";
import { initFichaOrden } from "@/lib/init-ficha-orden";

async function requireAdmin() {
  const sesion = await requireSesion("ADMIN");
  if (!sesion) {
    return { error: "Tenés que entrar como administrador." } as const;
  }
  return { sesion };
}

export async function guardarBorradorIngreso(data: BorradorIngreso) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  if (!data.nombre.trim() || !data.motor.trim()) {
    return { error: "Falta el nombre de quién trae el motor o la marca y modelo." };
  }
  if (!data.numeroBlock?.trim()) {
    return { error: "Falta el Nº de block (número de serie)." };
  }
  const jar = await cookies();
  jar.set(COOKIE_BORRADOR, JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });
  return { ok: true as const };
}

export async function leerBorradorIngreso(): Promise<BorradorIngreso | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_BORRADOR)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BorradorIngreso;
  } catch {
    return null;
  }
}

async function upsertCliente(
  clienteId: string | undefined,
  nombre: string,
  telefono: string,
) {
  if (clienteId) {
    const existe = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (existe) {
      if (existe.nombre !== nombre || existe.telefono !== telefono) {
        return prisma.cliente.update({
          where: { id: clienteId },
          data: { nombre, telefono },
        });
      }
      return existe;
    }
  }
  const mismo = await prisma.cliente.findFirst({
    where: { nombre, telefono },
  });
  if (mismo) return mismo;
  return prisma.cliente.create({ data: { nombre, telefono } });
}

export async function crearOrden(input: {
  clienteId?: string;
  nombre: string;
  telefono: string;
  motor: string;
  numeroBlock: string;
  motorCompleto: boolean;
  piezas: { tipo: TipoPieza; etiquetaLibre?: string }[];
}) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const nombre = input.nombre.trim();
  const telefono = input.telefono.trim();
  const motor = input.motor.trim();
  const numeroBlock = input.numeroBlock.trim();
  if (!nombre || !motor) {
    return { error: "Falta el nombre o la marca y modelo del motor." };
  }
  if (!numeroBlock) {
    return { error: "Falta el Nº de block (número de serie)." };
  }
  if (input.piezas.length === 0) {
    return { error: "Marcá por lo menos una pieza." };
  }

  const cliente = await upsertCliente(input.clienteId, nombre, telefono);
  const numero = await siguienteNumeroOrden();

  const orden = await prisma.orden.create({
    data: {
      numero,
      clienteId: cliente.id,
      motorMarca: motor,
      motorModelo: "",
      numeroBlock,
      motorCompleto: input.motorCompleto,
      creadaPor: auth.sesion.userId,
      piezas: {
        create: input.piezas.map((p) => ({
          tipo: p.tipo,
          etiquetaLibre: p.etiquetaLibre?.trim() || null,
        })),
      },
    },
  });

  await historialOrdenCreada(
    orden.id,
    auth.sesion.userId,
    auth.sesion.nombre,
    numeroBlock,
    input.motorCompleto,
  );

  await initFichaOrden(
    orden.id,
    input.piezas.map((p) => ({ tipo: p.tipo, etiquetaLibre: p.etiquetaLibre })),
  );

  const jar = await cookies();
  jar.delete(COOKIE_BORRADOR);

  revalidatePath("/admin");
  revalidatePath("/admin/ordenes");
  revalidatePath("/operario");
  revalidatePath(`/admin/orden/${orden.numero}`);
  redirect(`/admin/orden/${orden.numero}/creada`);
}

export async function crearOrdenDesdeBorrador(
  piezas: { tipo: TipoPieza; etiquetaLibre?: string }[],
) {
  const borrador = await leerBorradorIngreso();
  if (!borrador) {
    return { error: "Se perdió el ingreso. Volvé y cargalo de nuevo." };
  }
  return crearOrden({
    ...borrador,
    motorCompleto: borrador.motorCompleto,
    piezas,
  });
}
