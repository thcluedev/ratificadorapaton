import { redirect } from "next/navigation";
import { leerBorradorIngreso } from "@/app/actions/ordenes";
import { PiezasClient } from "./piezas-client";

export default async function PiezasPage() {
  const borrador = await leerBorradorIngreso();
  if (!borrador) redirect("/admin/ingreso");
  return <PiezasClient borrador={borrador} />;
}
