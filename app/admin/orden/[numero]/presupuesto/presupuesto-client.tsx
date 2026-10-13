"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CategoriaTrabajo, EstadoOrden, TipoArchivo } from "@/lib/types";
import {
  hrefComprobante,
  hrefOrigen,
  presupuestoGenerado,
  type OrigenNav,
} from "@/lib/nav";
import {
  agregarTrabajoLibre,
  cambiarPrecio,
  crearTrabajoYPrecio,
  tildarTrabajo,
} from "@/app/actions/presupuestos";
import { CATEGORIA_LABEL, CATEGORIAS } from "@/lib/labels";
import { formatDinero, parseDinero, sumarTildados } from "@/lib/money";
import { ActionBar } from "@/components/ActionBar";
import { BigButton } from "@/components/BigButton";
import { Header } from "@/components/Header";
import { MediaThumb } from "@/components/MediaThumb";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";

type CatalogoItem = {
  id: string;
  categoria: CategoriaTrabajo;
  descripcion: string;
  precioSugerido: number;
};

type TrabajoItem = {
  id: string;
  categoria: CategoriaTrabajo;
  descripcion: string;
  precio: number;
  tildado: boolean;
  esLibre: boolean;
};

type FotoItem = {
  id: string;
  url: string;
  tipo: TipoArchivo;
  duracionSeg: number | null;
};

export function PresupuestoClient({
  numero,
  estado,
  from,
  cliente,
  motor,
  catalogo,
  trabajos: iniciales,
  fotos,
  notas,
}: {
  numero: number;
  estado: EstadoOrden;
  from: OrigenNav;
  cliente: string;
  motor: string;
  catalogo: CatalogoItem[];
  trabajos: TrabajoItem[];
  fotos: Record<CategoriaTrabajo, FotoItem[]>;
  notas: Record<CategoriaTrabajo, string[]>;
}) {
  const router = useRouter();
  const [categoria, setCategoria] = useState<CategoriaTrabajo>("BLOCK");
  const [trabajos, setTrabajos] = useState(iniciales);
  const firma = iniciales.map((t) => `${t.id}:${t.tildado}:${t.precio}`).join("|");
  useEffect(() => {
    setTrabajos(iniciales);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firma]);
  const [error, setError] = useState("");
  const [nuevoDesc, setNuevoDesc] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [visor, setVisor] = useState<FotoItem | null>(null);
  const [, startSave] = useTransition();

  const itemsCat = catalogo.filter((c) => c.categoria === categoria);
  const libres = trabajos.filter((t) => t.categoria === categoria && t.esLibre);
  const media = fotos[categoria] ?? [];
  const total = useMemo(() => sumarTildados(trabajos), [trabajos]);

  function trabajoDe(item: CatalogoItem) {
    return trabajos.find(
      (t) => t.categoria === item.categoria && t.descripcion === item.descripcion && !t.esLibre,
    );
  }

  function guardar(fn: () => Promise<{ error?: string } | undefined>) {
    startSave(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
      else {
        setError("");
        router.refresh();
      }
    });
  }

  function onToggle(item: CatalogoItem) {
    const actual = trabajoDe(item);
    const next = !(actual?.tildado ?? false);
    if (actual) {
      setTrabajos((prev) =>
        prev.map((t) => (t.id === actual.id ? { ...t, tildado: next } : t)),
      );
      guardar(() =>
        tildarTrabajo({
          numero,
          categoria: item.categoria,
          descripcion: item.descripcion,
          precioSugerido: item.precioSugerido,
          tildado: next,
          trabajoId: actual.id,
        }),
      );
    } else if (next) {
      const tempId = `tmp-${item.id}`;
      setTrabajos((prev) => [
        ...prev,
        {
          id: tempId,
          categoria: item.categoria,
          descripcion: item.descripcion,
          precio: item.precioSugerido,
          tildado: true,
          esLibre: false,
        },
      ]);
      guardar(() =>
        tildarTrabajo({
          numero,
          categoria: item.categoria,
          descripcion: item.descripcion,
          precioSugerido: item.precioSugerido,
          tildado: true,
        }),
      );
    }
  }

  function onPrecio(item: CatalogoItem, texto: string) {
    const precio = parseDinero(texto);
    const actual = trabajoDe(item);
    if (actual) {
      setTrabajos((prev) =>
        prev.map((t) => (t.id === actual.id ? { ...t, precio, tildado: true } : t)),
      );
      if (!actual.id.startsWith("tmp-")) {
        guardar(() => cambiarPrecio(actual.id, numero, precio));
      }
    } else {
      const tempId = `tmp-${item.id}`;
      setTrabajos((prev) => [
        ...prev,
        {
          id: tempId,
          categoria: item.categoria,
          descripcion: item.descripcion,
          precio,
          tildado: true,
          esLibre: false,
        },
      ]);
      guardar(() =>
        crearTrabajoYPrecio({
          numero,
          categoria: item.categoria,
          descripcion: item.descripcion,
          precioSugerido: item.precioSugerido,
          precio,
        }),
      );
    }
  }

  function onAgregar() {
    const descripcion = nuevoDesc.trim();
    const precio = parseDinero(nuevoPrecio);
    if (!descripcion) {
      setError("Escribí el trabajo que querés agregar.");
      return;
    }
    guardar(async () => {
      const res = await agregarTrabajoLibre({ numero, categoria, descripcion, precio });
      if (!res?.error) {
        setNuevoDesc("");
        setNuevoPrecio("");
        setAgregando(false);
        setTrabajos((prev) => [
          ...prev,
          {
            id: `tmp-libre-${Date.now()}`,
            categoria,
            descripcion,
            precio,
            tildado: true,
            esLibre: true,
          },
        ]);
      }
      return res;
    });
  }

  return (
    <Screen
      header={
        <Header
          title={`Presupuesto · Orden ${numero}`}
          context={`${cliente} · ${motor}`}
          atrasHref={
            presupuestoGenerado(estado)
              ? hrefComprobante(numero, from)
              : hrefOrigen(numero, from)
          }
        />
      }
      footer={
        <ActionBar
          left={
            <div>
              <div className="text-[18px] font-bold uppercase tracking-[0.08em] text-gris">
                Total parcial
              </div>
              <div className="text-[40px] font-bold leading-none">{formatDinero(total)}</div>
            </div>
          }
          right={
            <BigButton onClick={() => router.push(hrefComprobante(numero, from))}>
              Ver presupuesto
            </BigButton>
          }
        />
      }
    >
      {error ? <p className="mb-4 text-[22px] font-bold">{error}</p> : null}
      <div className="flex gap-6">
        <aside className="flex w-[230px] shrink-0 flex-col gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCategoria(c);
                setAgregando(false);
              }}
              className={`min-h-[78px] rounded-[10px] border-[3px] px-3 text-left text-[20px] font-bold leading-tight ${
                c === categoria ? "border-acento bg-acento text-fondo" : "border-tinta bg-fondo"
              }`}
            >
              {CATEGORIA_LABEL[c]}
            </button>
          ))}
          <div className="mt-4">
            <div className="mb-2 text-[18px] font-bold text-gris">
              Fotos del {CATEGORIA_LABEL[categoria].toLowerCase()} ({media.length})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {media.map((f) => (
                <MediaThumb
                  key={f.id}
                  url={f.url}
                  tipo={f.tipo}
                  duracionSeg={f.duracionSeg}
                  onClick={() => setVisor(f)}
                />
              ))}
            </div>
            {(notas[categoria] ?? []).length > 0 ? (
              <div className="mt-4 text-[18px] leading-snug text-tinta">
                <div className="mb-1 font-bold uppercase tracking-[0.08em] text-gris">
                  Notas
                </div>
                {(notas[categoria] ?? []).map((n) => (
                  <p key={n} className="mb-2">
                    {n}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="flex flex-col gap-2">
            {itemsCat.map((item) => {
              const t = trabajoDe(item);
              const tildado = t?.tildado ?? false;
              return (
                <div
                  key={item.id}
                  className={`flex min-h-[78px] items-center gap-4 rounded-[10px] border-[3px] px-3 ${
                    tildado ? "border-acento" : "border-tinta"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggle(item)}
                    className="flex min-h-[78px] min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <span
                      className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[6px] border-[3px] text-[22px] font-bold ${
                        tildado ? "border-acento bg-acento text-fondo" : "border-tinta"
                      }`}
                    >
                      {tildado ? "✓" : ""}
                    </span>
                    <span className="text-[24px] font-bold leading-tight">{item.descripcion}</span>
                  </button>
                  {tildado ? (
                    <input
                      className="h-[58px] w-[160px] rounded-[10px] border-[3px] border-tinta bg-fondo px-3 text-right text-[24px] font-bold outline-none"
                      defaultValue={String(t?.precio ?? item.precioSugerido)}
                      inputMode="numeric"
                      onBlur={(e) => onPrecio(item, e.target.value)}
                    />
                  ) : (
                    <span className="w-[160px] text-right text-[24px] font-bold text-gris">$ —</span>
                  )}
                </div>
              );
            })}

            {libres.map((t) => (
              <div
                key={t.id}
                className="flex min-h-[78px] items-center justify-between rounded-[10px] border-[3px] border-acento px-4 text-[24px] font-bold"
              >
                <span>{t.descripcion}</span>
                <span>{formatDinero(t.precio)}</span>
              </div>
            ))}

            {agregando ? (
              <div className="flex flex-col gap-3 rounded-[10px] border-[3px] border-dashed border-tinta p-4">
                <TextField
                  value={nuevoDesc}
                  onChange={(e) => setNuevoDesc(e.target.value)}
                  placeholder="Descripción del trabajo"
                />
                <div className="flex gap-3">
                  <TextField
                    value={nuevoPrecio}
                    onChange={(e) => setNuevoPrecio(e.target.value)}
                    placeholder="Precio"
                    inputMode="numeric"
                  />
                  <BigButton onClick={onAgregar}>Agregar</BigButton>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAgregando(true)}
                className="flex min-h-[78px] items-center rounded-[10px] border-[3px] border-dashed border-tinta px-4 text-[24px] font-bold"
              >
                + Agregar trabajo
              </button>
            )}
          </div>
        </section>
      </div>

      {visor ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-fondo">
          <div className="flex min-h-0 flex-1 items-center justify-center p-6">
            {visor.tipo === "FOTO" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={visor.url} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <video src={visor.url} controls className="max-h-full max-w-full" />
            )}
          </div>
          <div className="border-t-[3px] border-tinta p-4">
            <BigButton className="w-full" onClick={() => setVisor(null)}>
              Cerrar
            </BigButton>
          </div>
        </div>
      ) : null}
    </Screen>
  );
}
