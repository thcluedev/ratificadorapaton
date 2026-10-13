import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type SavedFile = {
  url: string;
  nombre: string;
};

/**
 * Único punto de guardado de fotos y videos.
 * Hoy escribe en /public/uploads (disco local).
 * Para Vercel Blob, reemplazá el cuerpo de esta función
 * y devolvê la misma forma { url, nombre }.
 */
export async function saveFile(file: File): Promise<SavedFile> {
  const original = file.name || "archivo";
  const ext = path.extname(original).toLowerCase() || guessExt(file.type);
  const nombre = `${Date.now()}-${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, nombre), buffer);

  return { url: `/uploads/${nombre}`, nombre };
}

function guessExt(mime: string) {
  if (mime.startsWith("image/jpeg") || mime === "image/jpg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/heic") return ".heic";
  if (mime.startsWith("video/mp4")) return ".mp4";
  if (mime === "video/quicktime") return ".mov";
  if (mime === "video/webm") return ".webm";
  return "";
}
