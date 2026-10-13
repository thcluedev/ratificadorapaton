import type { CategoriaTrabajo, EstadoOrden, TipoPieza } from "@/lib/types";

export const ESTADO_LABEL: Record<EstadoOrden, string> = {
  PENDIENTE_MEDICION: "Pendiente de medición",
  EN_MEDICION: "En medición",
  MEDIDA: "Medida · armar presupuesto",
  PRESUPUESTADA: "Presupuesto entregado",
  ENTREGADA: "Entregada",
};

export const PIEZA_LABEL: Record<TipoPieza, string> = {
  BLOCK: "Block",
  BIELAS: "Bielas",
  PISTONES: "Pistones",
  CIGUENAL: "Cigüeñal",
  TAPA_CILINDRO: "Tapa de cilindro",
  ARBOL_LEVAS: "Árbol de levas",
  VOLANTE: "Volante",
  VARIOS: "Varios",
  OTRA: "Otra",
};

export const PIEZAS_CHECKLIST: TipoPieza[] = [
  "BLOCK",
  "BIELAS",
  "PISTONES",
  "CIGUENAL",
  "TAPA_CILINDRO",
  "ARBOL_LEVAS",
  "VOLANTE",
  "VARIOS",
];

export const CATEGORIA_LABEL: Record<CategoriaTrabajo, string> = {
  BLOCK: "Block",
  CIGUENAL: "Cigüeñal",
  ARBOL_LEVAS: "Árbol de Levas",
  TAPA_CILINDRO: "Tapa de Cilindro",
  VARIOS: "Varios",
};

export const CATEGORIAS: CategoriaTrabajo[] = [
  "BLOCK",
  "CIGUENAL",
  "ARBOL_LEVAS",
  "TAPA_CILINDRO",
  "VARIOS",
];

export function piezaToCategoria(tipo: TipoPieza): CategoriaTrabajo | null {
  switch (tipo) {
    case "BLOCK":
      return "BLOCK";
    case "CIGUENAL":
      return "CIGUENAL";
    case "ARBOL_LEVAS":
      return "ARBOL_LEVAS";
    case "TAPA_CILINDRO":
      return "TAPA_CILINDRO";
    case "VARIOS":
    case "BIELAS":
    case "PISTONES":
    case "VOLANTE":
    case "OTRA":
      return "VARIOS";
    default:
      return null;
  }
}

export function categoriaToPiezas(categoria: CategoriaTrabajo): TipoPieza[] {
  switch (categoria) {
    case "BLOCK":
      return ["BLOCK"];
    case "CIGUENAL":
      return ["CIGUENAL"];
    case "ARBOL_LEVAS":
      return ["ARBOL_LEVAS"];
    case "TAPA_CILINDRO":
      return ["TAPA_CILINDRO"];
    case "VARIOS":
      return ["VARIOS", "BIELAS", "PISTONES", "VOLANTE", "OTRA"];
  }
}

export function labelPieza(tipo: TipoPieza, etiquetaLibre?: string | null) {
  if (tipo === "OTRA" && etiquetaLibre) return etiquetaLibre;
  return PIEZA_LABEL[tipo];
}

export function motorTexto(marca: string, modelo: string) {
  const texto = [marca, modelo].filter(Boolean).join(" ").trim();
  return texto || "Sin marca";
}

export function formatFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

export function formatFechaCorta(fecha: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

export function conteoMaterial(fotos: number, videos: number) {
  const partes: string[] = [];
  partes.push(`${fotos} ${fotos === 1 ? "foto" : "fotos"}`);
  if (videos > 0) {
    partes.push(`${videos} ${videos === 1 ? "video" : "videos"}`);
  }
  return partes.join(" · ");
}

export function formatDuracion(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = Math.round(segundos % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function motorConBlock(numeroBlock: string, motor: string) {
  const block = numeroBlock.trim();
  if (!block) return motor;
  return `Block ${block} · ${motor}`;
}
