import type { TipoPieza } from "@/lib/types";

export type FichaItemDef = { id: string; label: string };

/** Ítems de la ficha Patón (PATON_FICHA PIEZAS MOTOR.pdf) por pieza principal. */
export const FICHA_ITEMS: Record<TipoPieza, FichaItemDef[]> = {
  BLOCK: [
    { id: "pernos", label: "Pernos" },
    { id: "camisas", label: "Camisas" },
    { id: "aros", label: "Aros" },
    { id: "tapas", label: "Tapas" },
    { id: "bancadas-bulones", label: "Bancadas c/ bulones" },
    { id: "esparragos", label: "Espárragos" },
    { id: "porta-reten-distribucion", label: "Block porta reten distribución" },
    { id: "porta-reten-bancada-trasera", label: "Porta reten bancada trasera" },
    { id: "guias", label: "Guías" },
  ],
  CIGUENAL: [
    { id: "con-chavetas", label: "Con chavetas" },
    { id: "sin-chavetas", label: "Sin chavetas" },
    { id: "contrapesos", label: "Contrapesos" },
  ],
  BIELAS: [
    { id: "bielas", label: "Bielas" },
    { id: "coj-bancadas", label: "Coj. bancadas" },
    { id: "coj-bielas-axiales", label: "Coj. bielas axiales" },
    { id: "bujetes", label: "Bujetes" },
  ],
  PISTONES: [
    { id: "pistones", label: "Pistones" },
    { id: "aros", label: "Aros" },
    { id: "pernos", label: "Pernos" },
    { id: "tapas", label: "Tapas" },
  ],
  ARBOL_LEVAS: [
    { id: "con-chaveta", label: "Con chaveta" },
    { id: "sin-chaveta", label: "Sin chaveta" },
    { id: "levas", label: "Levas" },
    { id: "botadores", label: "Botadores" },
    { id: "eje-comando", label: "Eje comando" },
    { id: "engranaje-comando", label: "Engranaje comando" },
    { id: "engranaje-distribucion", label: "Engranaje distribución" },
  ],
  TAPA_CILINDRO: [
    { id: "guias-varias", label: "Guías varias" },
    { id: "valvulas", label: "Válvulas" },
    { id: "resortes", label: "Resortes" },
    { id: "arandelas-resortes", label: "Arandelas resortes" },
    { id: "seguro-valvulas", label: "Seguro válvulas" },
    { id: "balancines", label: "Balancines" },
    { id: "torres-balancines", label: "Torres balancines" },
    { id: "eje-balancin", label: "Eje balancín" },
    { id: "tapa-valvulas", label: "Tapa válvulas" },
    { id: "varillas-levantavalvulas", label: "Varillas levantaválvulas" },
    { id: "esparragos-tapa", label: "Espárragos tapa cil." },
  ],
  VOLANTE: [
    { id: "volante", label: "Volante" },
    { id: "placa-embrague", label: "Placa embrague" },
    { id: "disco-embrague", label: "Disco embrague" },
    { id: "polea-trinquete", label: "Polea / trinquete" },
    { id: "bulones-antivibrador", label: "Bulones antivibrador" },
    { id: "carcaza-embrague", label: "Carcaza embrague" },
  ],
  VARIOS: [
    { id: "alternador", label: "Alternador" },
    { id: "bomba-aceite", label: "Bomba aceite" },
    { id: "bomba-agua", label: "Bomba agua" },
    { id: "bomba-combustible", label: "Bomba combustible" },
    { id: "cadena-distribucion", label: "Cadena distribución" },
    { id: "correa-dentada", label: "Correa dentada" },
    { id: "carter", label: "Carter" },
    { id: "filtros", label: "Filtros aceite / gasoil / nafta" },
    { id: "motor-arranque", label: "Motor de arranque" },
    { id: "termostato", label: "Termostato" },
    { id: "ventilador", label: "Ventilador" },
  ],
  OTRA: [{ id: "revision", label: "Revisar pieza" }],
};

export function itemsFichaParaPieza(tipo: TipoPieza, etiquetaLibre?: string | null): FichaItemDef[] {
  if (tipo === "OTRA" && etiquetaLibre?.trim()) {
    return [{ id: "revision", label: etiquetaLibre.trim() }];
  }
  return FICHA_ITEMS[tipo] ?? [];
}
