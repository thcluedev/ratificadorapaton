"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EstadoOrden, TipoArchivo, TipoPieza } from "@/lib/types";
import {
  borrarArchivo,
  guardarFichaItemDetalle,
  guardarPiezaMedicion,
  terminarMedicion,
} from "@/app/actions/mediciones";
import { ActionBar } from "@/components/ActionBar";
import { BigButton } from "@/components/BigButton";
import { CheckRow } from "@/components/CheckRow";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Header } from "@/components/Header";
import { MediaThumb } from "@/components/MediaThumb";
import {
  MedicionNotaCantidad,
  type DetalleNotaCantidad,
} from "@/components/MedicionNotaCantidad";
import { Screen } from "@/components/Screen";
import { detalleCantidadDesdeInput, resumenCantidad } from "@/lib/medicion-resumen";

type ArchivoUI = {
  id: string;
  url: string;
  tipo: TipoArchivo;
  duracionSeg: number | null;
};

type FichaItemUI = {
  itemId: string;
  label: string;
  marcado: boolean;
  nota: string;
  cantidadActiva: boolean;
  cantidadNumero: string;
  cantidadTexto: string;
  archivos: ArchivoUI[];
};

type UploadDestino = {
  pieza: TipoPieza;
  fichaItemId?: string;
};

function claveUpload(pieza: TipoPieza, fichaItemId?: string) {
  return fichaItemId ? `${pieza}:${fichaItemId}` : `${pieza}:`;
}

function BotonCamaraItem({
  disabled,
  label,
  fotos,
  onClick,
  invertido = false,
}: {
  disabled?: boolean;
  label: string;
  fotos?: number;
  onClick: () => void;
  invertido?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border-2 disabled:opacity-50 ${
        invertido
          ? "border-fondo/40 bg-fondo/15 text-fondo"
          : "border-tinta bg-fondo text-tinta"
      }`}
    >
      <IconoCamara size={20} />
      {fotos && fotos > 0 ? (
        <span
          className={`absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[12px] font-bold ${
            invertido ? "bg-fondo text-tinta" : "bg-acento text-fondo"
          }`}
        >
          {fotos}
        </span>
      ) : null}
    </button>
  );
}

type PiezaUI = {
  tipo: TipoPieza;
  label: string;
  archivos: ArchivoUI[];
  nota: string;
  cantidadActiva: boolean;
  cantidadNumero: string;
  cantidadTexto: string;
  fichaItems: FichaItemUI[];
};

type FichaItemDetalle = {
  marcado: boolean;
  nota: string;
  cantidadActiva: boolean;
  cantidadNumero: string;
  cantidadTexto: string;
};

function snapDetalle(d: DetalleNotaCantidad | FichaItemDetalle) {
  return JSON.stringify(d);
}

function mensajeErrorAccion(res: unknown): string | null {
  if (!res || typeof res !== "object" || !("error" in res)) return null;
  const msg = (res as { error?: unknown }).error;
  return typeof msg === "string" && msg.length > 0 ? msg : null;
}

function IconoCamara({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h3l1.6-2.2h6.8L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="14" r="3.1" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

export function MedicionClient({
  numero,
  motor,
  numeroBlock,
  cliente,
  estado,
  piezas,
}: {
  numero: number;
  motor: string;
  numeroBlock: string;
  cliente: string;
  estado: EstadoOrden;
  piezas: PiezaUI[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [piezaDetalle, setPiezaDetalle] = useState<Record<string, DetalleNotaCantidad>>(() =>
    Object.fromEntries(
      piezas.map((p) => [
        p.tipo,
        {
          nota: p.nota,
          cantidadActiva: p.cantidadActiva,
          cantidadNumero: p.cantidadNumero,
          cantidadTexto: p.cantidadTexto,
        },
      ]),
    ),
  );
  const [fichaDetalle, setFichaDetalle] = useState<
    Record<string, Record<string, FichaItemDetalle>>
  >(() => {
    const map: Record<string, Record<string, FichaItemDetalle>> = {};
    for (const p of piezas) {
      map[p.tipo] = Object.fromEntries(
        p.fichaItems.map((i) => [
          i.itemId,
          {
            marcado: i.marcado,
            nota: i.nota,
            cantidadActiva: i.cantidadActiva,
            cantidadNumero: i.cantidadNumero,
            cantidadTexto: i.cantidadTexto,
          },
        ]),
      );
    }
    return map;
  });
  const [pendingUpload, setPendingUpload] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [visor, setVisor] = useState<ArchivoUI | null>(null);
  const [pendingFin, startFin] = useTransition();
  const [pendingBorrar, startBorrar] = useTransition();
  const [, startGuardado] = useTransition();
  const [fichaAbierta, setFichaAbierta] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const p of piezas) {
      if (p.fichaItems.length > 0) map[p.tipo] = true;
    }
    return map;
  });
  const [itemDetalleAbierto, setItemDetalleAbierto] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const p of piezas) {
      for (const i of p.fichaItems) {
        const key = claveUpload(p.tipo, i.itemId);
        const det = {
          nota: i.nota,
          cantidadActiva: i.cantidadActiva,
          cantidadNumero: i.cantidadNumero,
          cantidadTexto: i.cantidadTexto,
        };
        map[key] = i.nota.trim().length > 0 || resumenCantidad(det) != null;
      }
    }
    return map;
  });
  const destinoRef = useRef<UploadDestino>({
    pieza: piezas[0]?.tipo ?? "VARIOS",
  });
  const fotoRef = useRef<HTMLInputElement>(null);
  const piezaDetalleRef = useRef(piezaDetalle);
  piezaDetalleRef.current = piezaDetalle;
  const fichaDetalleRef = useRef(fichaDetalle);
  fichaDetalleRef.current = fichaDetalle;
  const guardadasPiezaRef = useRef<Record<string, string>>(
    Object.fromEntries(
      piezas.map((p) => [
        p.tipo,
        snapDetalle({
          nota: p.nota,
          cantidadActiva: p.cantidadActiva,
          cantidadNumero: p.cantidadNumero,
          cantidadTexto: p.cantidadTexto,
        }),
      ]),
    ),
  );
  const guardadasFichaRef = useRef<Record<string, string>>(
    (() => {
      const map: Record<string, string> = {};
      for (const p of piezas) {
        for (const i of p.fichaItems) {
          map[`${p.tipo}:${i.itemId}`] = snapDetalle({
            marcado: i.marcado,
            nota: i.nota,
            cantidadActiva: i.cantidadActiva,
            cantidadNumero: i.cantidadNumero,
            cantidadTexto: i.cantidadTexto,
          });
        }
      }
      return map;
    })(),
  );
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  async function persistirPieza(tipo: TipoPieza) {
    const det = piezaDetalleRef.current[tipo];
    if (!det) return true;
    const snap = snapDetalle(det);
    if (snap === guardadasPiezaRef.current[tipo]) return true;
    const res = await guardarPiezaMedicion(numero, tipo, {
      observacion: det.nota,
      cantidadActiva: det.cantidadActiva,
      cantidadNumero: det.cantidadNumero,
      cantidadTexto: det.cantidadTexto,
    });
    const errPieza = mensajeErrorAccion(res);
    if (errPieza) {
      setError(errPieza);
      return false;
    }
    guardadasPiezaRef.current[tipo] = snap;
    return true;
  }

  async function persistirFichaItem(pieza: TipoPieza, itemId: string) {
    const det = fichaDetalleRef.current[pieza]?.[itemId];
    if (!det) return true;
    const key = `${pieza}:${itemId}`;
    const snap = snapDetalle(det);
    if (snap === guardadasFichaRef.current[key]) return true;
    const res = await guardarFichaItemDetalle(numero, pieza, itemId, det);
    const errFicha = mensajeErrorAccion(res);
    if (errFicha) {
      setError(errFicha);
      return false;
    }
    guardadasFichaRef.current[key] = snap;
    return true;
  }

  async function persistirTodas() {
    for (const p of piezas) {
      if (!(await persistirPieza(p.tipo))) return false;
      for (const item of p.fichaItems) {
        if (!(await persistirFichaItem(p.tipo, item.itemId))) return false;
      }
    }
    return true;
  }

  function programarGuardadoPieza(tipo: TipoPieza) {
    const key = `pieza:${tipo}`;
    const prev = timersRef.current[key];
    if (prev) clearTimeout(prev);
    timersRef.current[key] = setTimeout(() => {
      startGuardado(async () => {
        await persistirPieza(tipo);
      });
    }, 450);
  }

  function programarGuardadoFicha(pieza: TipoPieza, itemId: string) {
    const key = `ficha:${pieza}:${itemId}`;
    const prev = timersRef.current[key];
    if (prev) clearTimeout(prev);
    timersRef.current[key] = setTimeout(() => {
      startGuardado(async () => {
        await persistirFichaItem(pieza, itemId);
      });
    }, 450);
  }

  function patchPieza(tipo: TipoPieza, patch: Partial<DetalleNotaCantidad>) {
    setPiezaDetalle((prev) => {
      const next = { ...prev[tipo], ...patch };
      return { ...prev, [tipo]: next };
    });
    programarGuardadoPieza(tipo);
  }

  function patchFichaItem(pieza: TipoPieza, itemId: string, patch: Partial<FichaItemDetalle>) {
    setFichaDetalle((prev) => {
      const cur = prev[pieza]?.[itemId];
      if (!cur) return prev;
      return {
        ...prev,
        [pieza]: { ...prev[pieza], [itemId]: { ...cur, ...patch } },
      };
    });
    programarGuardadoFicha(pieza, itemId);
  }

  async function subir(file: File, tipo: TipoArchivo, duracionSeg?: number) {
    setError("");
    const form = new FormData();
    form.set("file", file);
    form.set("numero", String(numero));
    form.set("piezaTipo", destinoRef.current.pieza);
    if (destinoRef.current.fichaItemId) {
      form.set("fichaItemId", destinoRef.current.fichaItemId);
    }
    form.set("tipo", tipo);
    if (duracionSeg) form.set("duracionSeg", String(Math.round(duracionSeg)));

    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error || "No se pudo guardar el archivo. Probá de nuevo.");
      return;
    }
    router.refresh();
  }

  function onFoto(file?: File) {
    if (!file) return;
    const { pieza, fichaItemId } = destinoRef.current;
    const clave = claveUpload(pieza, fichaItemId);
    setPendingUpload(clave);
    subir(file, "FOTO").finally(() => setPendingUpload(null));
  }

  function abrirCamara(pieza: TipoPieza, fichaItemId?: string) {
    destinoRef.current = { pieza, fichaItemId };
    fotoRef.current?.click();
  }

  function toggleFicha(piezaTipo: TipoPieza, itemId: string) {
    const actual = fichaDetalle[piezaTipo]?.[itemId]?.marcado ?? false;
    patchFichaItem(piezaTipo, itemId, { marcado: !actual });
  }

  return (
    <Screen
      header={
        <Header
          title={`Orden ${numero}`}
          context={
            numeroBlock.trim()
              ? `Block ${numeroBlock.trim()} · ${cliente} · ${motor}`
              : `${cliente} · ${motor}`
          }
          onAtras={() => {
            startGuardado(async () => {
              const ok = await persistirTodas();
              if (ok) router.push("/operario");
            });
          }}
        />
      }
      footer={
        <ActionBar
          right={
            <BigButton onClick={() => setConfirm(true)}>Terminé de medir</BigButton>
          }
        />
      }
    >
      <input
        ref={fotoRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          onFoto(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error ? <p className="mb-4 text-[22px] font-bold">{error}</p> : null}

      <div className="mx-auto flex max-w-[1100px] flex-col gap-8">
        {piezas.map((p) => {
          const fotosItem = p.fichaItems.reduce(
            (n, i) => n + i.archivos.filter((a) => a.tipo === "FOTO").length,
            0,
          );
          const fotosPieza = p.archivos.filter((a) => a.tipo === "FOTO").length;
          const fotos = fotosPieza + fotosItem;
          const ocupadoPieza = pendingUpload === claveUpload(p.tipo);
          const sinFicha = p.fichaItems.length === 0;
          const marcadosFicha = p.fichaItems.filter(
            (i) => fichaDetalle[p.tipo]?.[i.itemId]?.marcado ?? i.marcado,
          ).length;
          const detPieza = piezaDetalle[p.tipo] ?? {
            nota: p.nota,
            cantidadActiva: p.cantidadActiva,
            cantidadNumero: p.cantidadNumero,
            cantidadTexto: p.cantidadTexto,
          };
          const abierta = fichaAbierta[p.tipo] ?? false;
          const cantidadPieza = resumenCantidad(detPieza);
          return (
            <article
              key={p.tipo}
              className="overflow-hidden rounded-[12px] border-[4px] border-tinta shadow-[0_4px_0_0_var(--color-tinta)]"
            >
              <header className="flex items-start justify-between gap-3 bg-tinta px-4 py-3 text-fondo">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold uppercase tracking-[0.12em] text-fondo/70">
                    Pieza
                  </p>
                  <h2 className="text-[30px] font-bold leading-tight">{p.label}</h2>
                  {cantidadPieza ? (
                    <p className="mt-1 text-[18px] font-bold text-fondo/90">
                      Cantidad pieza: {cantidadPieza}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[14px] font-bold tabular-nums text-fondo/80">
                    {fotos} {fotos === 1 ? "foto" : "fotos"}
                    {ocupadoPieza ? " · subiendo…" : ""}
                  </span>
                  {sinFicha ? (
                    <BotonCamaraItem
                      invertido
                      disabled={ocupadoPieza}
                      label={`Sacar foto · ${p.label}`}
                      onClick={() => abrirCamara(p.tipo)}
                    />
                  ) : null}
                </div>
              </header>

              <div className="space-y-4 bg-fondo p-4">
                <section className="rounded-[10px] border-l-[6px] border-acento bg-acento/5 p-4">
                  <h3 className="mb-3 text-[22px] font-bold leading-tight text-acento">
                    Cantidad y notas de la pieza
                  </h3>
                  <p className="mb-3 text-[17px] text-gris">
                    Total o observaciones generales de{" "}
                    <span className="font-bold text-tinta">{p.label}</span> (no confundir con
                    cada ítem de la ficha).
                  </p>
                  <MedicionNotaCantidad
                    nivel="pieza"
                    detalle={detPieza}
                    notaPlaceholder={`Notas de ${p.label}`}
                    onNotaChange={(valor) => patchPieza(p.tipo, { nota: valor })}
                    onNotaBlur={() => {
                      startGuardado(async () => {
                        await persistirPieza(p.tipo);
                      });
                    }}
                    onCantidadChange={(valor) =>
                      patchPieza(p.tipo, detalleCantidadDesdeInput(valor))
                    }
                    onCantidadBlur={() => {
                      startGuardado(async () => {
                        await persistirPieza(p.tipo);
                      });
                    }}
                  />
                </section>

                {p.fichaItems.length > 0 ? (
                  <section className="rounded-[10px] border-[3px] border-dashed border-tinta/40 bg-tinta/5 p-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFichaAbierta((prev) => ({ ...prev, [p.tipo]: !abierta }))
                      }
                      className="flex min-h-[52px] w-full items-center justify-between rounded-[8px] border-2 border-tinta bg-fondo px-3 text-left"
                    >
                      <div>
                        <p className="text-[14px] font-bold uppercase tracking-wide text-gris">
                          Ficha · {p.label}
                        </p>
                        <span className="text-[20px] font-bold">Ítems a revisar</span>
                      </div>
                      <span className="text-[17px] font-bold text-gris">
                        {marcadosFicha}/{p.fichaItems.length} · {abierta ? "Ocultar" : "Mostrar"}
                      </span>
                    </button>
                    {abierta ? (
                      <div className="mt-3 flex flex-col gap-3">
                        {p.fichaItems.map((item, idx) => {
                          const det =
                            fichaDetalle[p.tipo]?.[item.itemId] ?? {
                              marcado: item.marcado,
                              nota: item.nota,
                              cantidadActiva: item.cantidadActiva,
                              cantidadNumero: item.cantidadNumero,
                              cantidadTexto: item.cantidadTexto,
                            };
                          const cantidadItem = resumenCantidad(det);
                          const fotosItem = item.archivos.filter((a) => a.tipo === "FOTO").length;
                          const claveItem = claveUpload(p.tipo, item.itemId);
                          const subiendoItem = pendingUpload === claveItem;
                          const detalleAbierto = itemDetalleAbierto[claveItem] ?? false;
                          const notaPreview = det.nota.trim();
                          return (
                            <div
                              key={item.itemId}
                              className="rounded-[10px] border-2 border-tinta/30 bg-fondo p-3"
                            >
                              <p className="mb-2 text-[14px] font-bold uppercase text-gris">
                                Ítem {idx + 1} de {p.fichaItems.length}
                                {subiendoItem ? " · subiendo foto…" : ""}
                              </p>
                              <div className="flex items-stretch gap-2">
                                <div className="min-w-0 flex-1">
                                  <CheckRow
                                    compact
                                    checked={det.marcado}
                                    label={item.label}
                                    onToggle={() => toggleFicha(p.tipo, item.itemId)}
                                  />
                                </div>
                                <BotonCamaraItem
                                  disabled={subiendoItem}
                                  fotos={fotosItem}
                                  label={`Sacar foto · ${item.label}`}
                                  onClick={() => abrirCamara(p.tipo, item.itemId)}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setItemDetalleAbierto((prev) => ({
                                    ...prev,
                                    [claveItem]: !detalleAbierto,
                                  }))
                                }
                                className="mt-2 flex min-h-[48px] w-full items-center justify-between gap-2 rounded-[8px] border-2 border-tinta/50 bg-tinta/5 px-3 text-left"
                              >
                                <span className="text-[18px] font-bold">
                                  {detalleAbierto ? "Ocultar" : "Ver"} nota y cantidad
                                </span>
                                <span className="shrink-0 text-[16px] font-bold text-gris">
                                  {detalleAbierto ? "▲" : "▼"}
                                </span>
                              </button>

                              {!detalleAbierto && (notaPreview || cantidadItem) ? (
                                <div className="mt-2 rounded-[8px] bg-acento/5 px-3 py-2 text-[17px] leading-snug">
                                  {notaPreview ? (
                                    <p>
                                      <span className="font-bold text-gris">Nota: </span>
                                      {notaPreview}
                                    </p>
                                  ) : null}
                                  {cantidadItem ? (
                                    <p className={notaPreview ? "mt-1" : ""}>
                                      <span className="font-bold text-gris">Cantidad: </span>
                                      {cantidadItem}
                                    </p>
                                  ) : null}
                                </div>
                              ) : null}

                              {detalleAbierto ? (
                                <>
                                  <MedicionNotaCantidad
                                    nivel="item"
                                    detalle={det}
                                    notaPlaceholder={`Nota · ${item.label}`}
                                    onNotaChange={(valor) =>
                                      patchFichaItem(p.tipo, item.itemId, { nota: valor })
                                    }
                                    onNotaBlur={() => {
                                      startGuardado(async () => {
                                        await persistirFichaItem(p.tipo, item.itemId);
                                      });
                                    }}
                                    onCantidadChange={(valor) =>
                                      patchFichaItem(
                                        p.tipo,
                                        item.itemId,
                                        detalleCantidadDesdeInput(valor),
                                      )
                                    }
                                    onCantidadBlur={() => {
                                      startGuardado(async () => {
                                        await persistirFichaItem(p.tipo, item.itemId);
                                      });
                                    }}
                                  />
                                  {item.archivos.length > 0 ? (
                                    <div className="mt-2 grid grid-cols-4 gap-2">
                                      {item.archivos.map((a) => (
                                        <MediaThumb
                                          key={a.id}
                                          url={a.url}
                                          tipo={a.tipo}
                                          duracionSeg={a.duracionSeg}
                                          onClick={() => setVisor(a)}
                                        />
                                      ))}
                                    </div>
                                  ) : null}
                                </>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {p.archivos.length > 0 ? (
                  <section>
                    <p className="mb-2 text-[16px] font-bold uppercase text-gris">
                      Fotos generales · {p.label}
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                  {p.archivos.map((a) => (
                    <MediaThumb
                      key={a.id}
                      url={a.url}
                      tipo={a.tipo}
                      duracionSeg={a.duracionSeg}
                      onClick={() => setVisor(a)}
                    />
                  ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </article>
          );
        })}
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
          <div className="flex gap-4 border-t-[3px] border-tinta p-4">
            <BigButton variant="secondary" className="flex-1" onClick={() => setVisor(null)}>
              Cerrar
            </BigButton>
            <BigButton
              className="flex-1"
              pending={pendingBorrar}
              onClick={() => {
                startBorrar(async () => {
                  const res = await borrarArchivo(visor.id, numero);
                  const errBorrar = mensajeErrorAccion(res);
                  if (errBorrar) setError(errBorrar);
                  setVisor(null);
                  router.refresh();
                });
              }}
            >
              Borrar
            </BigButton>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirm}
        title="¿Terminaste de medir?"
        body="La orden pasa a medida y el administrador puede armar el presupuesto. No se puede deshacer desde acá."
        confirmLabel="Sí, terminé"
        pending={pendingFin}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          startFin(async () => {
            const notasOk = await persistirTodas();
            if (!notasOk) {
              setConfirm(false);
              return;
            }
            const res = await terminarMedicion(numero);
            const errFin = mensajeErrorAccion(res);
            if (errFin) {
              setError(errFin);
              setConfirm(false);
              return;
            }
            router.push("/operario");
          });
        }}
      />

      {estado === "MEDIDA" ? (
        <p className="mt-4 text-[20px] text-gris">Esta orden ya está marcada como medida.</p>
      ) : null}
    </Screen>
  );
}
