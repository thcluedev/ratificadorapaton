"use client";

import { useState, useTransition } from "react";
import type { Rol } from "@/lib/types";
import { ingresar } from "@/app/actions/auth";
import { Header } from "@/components/Header";
import { NumericKeypad } from "@/components/NumericKeypad";
import { RoleCard } from "@/components/RoleCard";
import { Screen } from "@/components/Screen";

type UserOpt = { id: string; nombre: string; rol: Rol };

export function LoginClient({ users }: { users: UserOpt[] }) {
  const [rol, setRol] = useState<Rol | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const delRol = users.filter((u) => u.rol === rol);
  const elegido = users.find((u) => u.id === userId);

  function elegirRol(next: Rol) {
    setRol(next);
    setUserId(null);
    setPin("");
    setError("");
  }

  function elegirUser(id: string) {
    setUserId(id);
    setPin("");
    setError("");
  }

  function onDigit(d: string) {
    if (pin.length >= 4 || pending) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4 && userId) {
      startTransition(async () => {
        const res = await ingresar(userId, next);
        if (res?.error) {
          setError(res.error);
          setPin("");
        }
      });
    }
  }

  return (
    <Screen
      header={
        <Header
          title="Rectificaciones Patón"
          onAtras={rol ? () => (userId ? setUserId(null) : setRol(null)) : undefined}
        />
      }
    >
      {!rol ? (
        <div className="flex h-full min-h-[520px] flex-col justify-center">
          <div className="mb-8 text-center text-[18px] font-bold uppercase tracking-[0.12em] text-gris">
            ¿Quién sos?
          </div>
          <div className="flex gap-6">
            <RoleCard
              title="Administrador"
              subtitle="Ingresos y presupuestos"
              onClick={() => elegirRol("ADMIN")}
            />
            <RoleCard
              title="Operario"
              subtitle="Medición y fotos"
              onClick={() => elegirRol("OPERARIO")}
            />
          </div>
        </div>
      ) : !userId ? (
        <div className="mx-auto max-w-[720px]">
          <div className="mb-6 text-[18px] font-bold uppercase tracking-[0.12em] text-gris">
            {rol === "ADMIN" ? "Administradores" : "Operarios"}
          </div>
          <div className="flex flex-col gap-3">
            {delRol.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => elegirUser(u.id)}
                className="flex min-h-[78px] items-center justify-between rounded-[10px] border-[3px] border-tinta px-5 text-left text-[26px] font-bold"
              >
                <span>{u.nombre}</span>
                <span aria-hidden>›</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-[480px] pt-2">
          <div className="text-center text-[22px] text-gris">{elegido?.nombre}</div>
          <div className="mt-2 text-center text-[18px] font-bold uppercase tracking-[0.12em] text-gris">
            PIN de 4 dígitos
          </div>
          <div className="my-8 flex justify-center gap-5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-6 w-6 rounded-full border-[3px] border-tinta ${
                  i < pin.length ? "bg-tinta" : "bg-fondo"
                }`}
              />
            ))}
          </div>
          {error ? (
            <p className="mb-6 text-center text-[22px] font-bold leading-snug">{error}</p>
          ) : pending ? (
            <p className="mb-6 text-center text-[22px] text-gris">Entrando…</p>
          ) : (
            <div className="mb-6 h-[33px]" />
          )}
          <NumericKeypad
            onDigit={onDigit}
            onBorrar={() => {
              setPin((p) => p.slice(0, -1));
              setError("");
            }}
          />
        </div>
      )}
    </Screen>
  );
}
