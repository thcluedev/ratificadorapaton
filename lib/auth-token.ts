export const COOKIE_SESION = "paton_sesion";

export type RolSesion = "ADMIN" | "OPERARIO";

export type Sesion = {
  userId: string;
  nombre: string;
  rol: RolSesion;
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("Falta SESSION_SECRET");
  }
  return value;
}

function toBase64Url(bytes: Uint8Array | string) {
  const arr = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  let bin = "";
  arr.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(new Uint8Array(sig));
}

export async function firmarSesion(sesion: Sesion) {
  const payload = toBase64Url(JSON.stringify(sesion));
  const firma = await hmac(payload);
  return `${payload}.${firma}`;
}

export async function leerSesionToken(token: string | undefined): Promise<Sesion | null> {
  if (!token) return null;
  const [payload, firma] = token.split(".");
  if (!payload || !firma) return null;
  const esperada = await hmac(payload);
  if (firma.length !== esperada.length) return null;
  let iguales = 0;
  for (let i = 0; i < firma.length; i++) {
    iguales |= firma.charCodeAt(i) ^ esperada.charCodeAt(i);
  }
  if (iguales !== 0) return null;
  try {
    const data = JSON.parse(fromBase64Url(payload)) as Sesion;
    if (!data.userId || !data.rol || !data.nombre) return null;
    return data;
  } catch {
    return null;
  }
}
