import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import type { Rol } from "@prisma/client";
import { prisma } from "./prisma";
import {
  COOKIE_SESION,
  firmarSesion,
  leerSesionToken,
  type Sesion,
} from "./auth-token";

export { COOKIE_SESION, leerSesionToken, type Sesion };

const MAX_AGE = 60 * 60 * 12;

export async function getSesion(): Promise<Sesion | null> {
  const jar = await cookies();
  return leerSesionToken(jar.get(COOKIE_SESION)?.value);
}

export async function requireSesion(rol?: Rol) {
  const sesion = await getSesion();
  if (!sesion) return null;
  if (rol && sesion.rol !== rol) return null;
  return sesion;
}

export async function setSesionCookie(sesion: Sesion) {
  const jar = await cookies();
  jar.set(COOKIE_SESION, await firmarSesion(sesion), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSesionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_SESION);
}

export async function verificarPin(userId: string, pin: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, activo: true },
  });
  if (!user) return null;
  const ok = await compare(pin, user.pin);
  if (!ok) return null;
  return user;
}
