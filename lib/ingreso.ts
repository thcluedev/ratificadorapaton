export const COOKIE_BORRADOR = "paton_ingreso";

export type BorradorIngreso = {
  clienteId?: string;
  nombre: string;
  telefono: string;
  motor: string;
  numeroBlock: string;
  motorCompleto: boolean;
};

export function ingresoDatosHref(motorCompleto: boolean) {
  return motorCompleto ? "/admin/ingreso/datos?tipo=completo" : "/admin/ingreso/datos?tipo=piezas";
}
