"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { guardarBorradorIngreso } from "@/app/actions/ordenes";
import type { BorradorIngreso } from "@/lib/ingreso";
import { ActionBar } from "@/components/ActionBar";
import { BigButton } from "@/components/BigButton";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { FieldLabel, TextField } from "@/components/TextField";

type ClienteOpt = { id: string; nombre: string; telefono: string };

export function IngresoClient({
  clientes,
  borrador,
  motorCompleto,
}: {
  clientes: ClienteOpt[];
  borrador: BorradorIngreso | null;
  motorCompleto: boolean;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState(borrador?.nombre ?? "");
  const [telefono, setTelefono] = useState(borrador?.telefono ?? "");
  const [clienteId, setClienteId] = useState<string | undefined>(borrador?.clienteId);
  const [motor, setMotor] = useState(borrador?.motor ?? "");
  const [numeroBlock, setNumeroBlock] = useState(borrador?.numeroBlock ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const contextoTipo = motorCompleto ? "Motor completo" : "Piezas sueltas";

  const sugeridos = useMemo(() => {
    const q = nombre.trim().toLowerCase();
    if (q.length < 1) return [];
    return clientes
      .filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) || c.telefono.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
      )
      .slice(0, 5);
  }, [clientes, nombre]);

  function elegirCliente(c: ClienteOpt) {
    setClienteId(c.id);
    setNombre(c.nombre);
    setTelefono(c.telefono);
  }

  function confirmar() {
    setError("");
    if (!nombre.trim() || !motor.trim()) {
      setError("Completá quién trae el motor y la marca y modelo.");
      return;
    }
    if (!numeroBlock.trim()) {
      setError("El Nº de block (número de serie) es obligatorio para identificar el motor.");
      return;
    }
    const data = {
      clienteId,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      motor: motor.trim(),
      numeroBlock: numeroBlock.trim(),
      motorCompleto,
    };
    startTransition(async () => {
      const res = await guardarBorradorIngreso(data);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.push("/admin/ingreso/piezas");
    });
  }

  return (
    <Screen
      header={
        <Header title="Ingreso" context={contextoTipo} atrasHref="/admin/ingreso" />
      }
      footer={
        <ActionBar
          left={
            <BigButton variant="secondary" onClick={() => router.push("/admin/ingreso")}>
              Cancelar
            </BigButton>
          }
          right={
            <BigButton pending={pending} onClick={confirmar}>
              Siguiente
            </BigButton>
          }
        />
      }
    >
      <div className="mx-auto flex max-w-[880px] flex-col gap-8">
        <section>
          <FieldLabel>Nº de block (número de serie)</FieldLabel>
          <TextField
            value={numeroBlock}
            onChange={(e) => setNumeroBlock(e.target.value)}
            placeholder="Ej. 12345678"
            autoComplete="off"
            required
          />
          <p className="mt-2 text-[18px] text-gris">Obligatorio. Sirve para identificar el motor en el taller.</p>
        </section>

        <section>
          <FieldLabel>¿Quién trae el motor?</FieldLabel>
          <div className="flex gap-3">
            <TextField
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setClienteId(undefined);
              }}
              placeholder="Nombre"
              autoComplete="off"
            />
            <TextField
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono"
              inputMode="tel"
              autoComplete="off"
            />
          </div>
          {sugeridos.length > 0 && !clienteId ? (
            <div className="mt-3 flex flex-col gap-2">
              {sugeridos.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => elegirCliente(c)}
                  className="flex min-h-[78px] items-center justify-between rounded-[10px] border-[3px] border-tinta px-4 text-left text-[22px] font-bold"
                >
                  <span>{c.nombre}</span>
                  <span className="text-gris">{c.telefono}</span>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section>
          <FieldLabel>Marca y modelo</FieldLabel>
          <TextField
            value={motor}
            onChange={(e) => setMotor(e.target.value)}
            placeholder="Ford Ranger / Puma 2.2"
            autoComplete="off"
          />
        </section>

        {error ? <p className="text-[22px] font-bold">{error}</p> : null}
      </div>
    </Screen>
  );
}
