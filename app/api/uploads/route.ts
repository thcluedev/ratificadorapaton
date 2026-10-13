import { NextResponse } from "next/server";
import type { TipoArchivo, TipoPieza } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSesion } from "@/lib/auth";
import { saveFile } from "@/lib/storage";
import { historialArchivo, historialCambioEstado } from "@/lib/orden-historial";

const PIEZAS: TipoPieza[] = [
  "BLOCK",
  "BIELAS",
  "PISTONES",
  "CIGUENAL",
  "TAPA_CILINDRO",
  "ARBOL_LEVAS",
  "VOLANTE",
  "VARIOS",
  "OTRA",
];

export async function POST(request: Request) {
  const sesion = await getSesion();
  if (!sesion || sesion.rol !== "OPERARIO") {
    return NextResponse.json(
      { error: "Tenés que entrar como operario." },
      { status: 401 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const numero = Number(form.get("numero"));
  const piezaTipo = String(form.get("piezaTipo")) as TipoPieza;
  const tipo = String(form.get("tipo")) as TipoArchivo;
  const duracionSegRaw = form.get("duracionSeg");
  const duracionSeg = duracionSegRaw ? Number(duracionSegRaw) : null;
  const fichaItemIdRaw = form.get("fichaItemId");
  const fichaItemId =
    typeof fichaItemIdRaw === "string" && fichaItemIdRaw.trim()
      ? fichaItemIdRaw.trim()
      : null;

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No llegó el archivo." }, { status: 400 });
  }
  if (!Number.isFinite(numero)) {
    return NextResponse.json({ error: "Falta el número de orden." }, { status: 400 });
  }
  if (!PIEZAS.includes(piezaTipo) || (tipo !== "FOTO" && tipo !== "VIDEO")) {
    return NextResponse.json({ error: "Los datos del archivo no cierran." }, { status: 400 });
  }

  const orden = await prisma.orden.findUnique({ where: { numero } });
  if (!orden) {
    return NextResponse.json({ error: "No encontramos esa orden." }, { status: 404 });
  }
  if (orden.estado === "PRESUPUESTADA" || orden.estado === "ENTREGADA") {
    return NextResponse.json(
      { error: "Esta orden ya no se puede medir." },
      { status: 400 },
    );
  }

  if (fichaItemId) {
    const item = await prisma.piezaFichaItem.findFirst({
      where: { ordenId: orden.id, piezaTipo, itemId: fichaItemId },
    });
    if (!item) {
      return NextResponse.json(
        { error: "Ese ítem de la ficha no corresponde a esta orden." },
        { status: 400 },
      );
    }
  }

  try {
    const saved = await saveFile(file);
    await prisma.archivo.create({
      data: {
        ordenId: orden.id,
        piezaTipo,
        fichaItemId,
        tipo,
        url: saved.url,
        duracionSeg: Number.isFinite(duracionSeg) ? duracionSeg : null,
        subidoPor: sesion.userId,
      },
    });

    await historialArchivo(
      orden.id,
      sesion.userId,
      sesion.nombre,
      piezaTipo,
      tipo,
      "subio",
    );

    if (orden.estado === "PENDIENTE_MEDICION") {
      await prisma.orden.update({
        where: { id: orden.id },
        data: { estado: "EN_MEDICION" },
      });
      await historialCambioEstado(
        orden.id,
        sesion.userId,
        sesion.nombre,
        "PENDIENTE_MEDICION",
        "EN_MEDICION",
      );
    }

    return NextResponse.json({ ok: true, url: saved.url });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el archivo. Probá de nuevo." },
      { status: 500 },
    );
  }
}
