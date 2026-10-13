export type Rol = "ADMIN" | "OPERARIO";

export type EstadoOrden =
  | "PENDIENTE_MEDICION"
  | "EN_MEDICION"
  | "MEDIDA"
  | "PRESUPUESTADA"
  | "ENTREGADA";

export type TipoPieza =
  | "BLOCK"
  | "BIELAS"
  | "PISTONES"
  | "CIGUENAL"
  | "TAPA_CILINDRO"
  | "ARBOL_LEVAS"
  | "VOLANTE"
  | "VARIOS"
  | "OTRA";

export type TipoArchivo = "FOTO" | "VIDEO";

export type CategoriaTrabajo =
  | "BLOCK"
  | "CIGUENAL"
  | "ARBOL_LEVAS"
  | "TAPA_CILINDRO"
  | "VARIOS";
