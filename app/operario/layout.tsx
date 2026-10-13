import { requireSesion } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OperarioLayout({ children }: { children: React.ReactNode }) {
  const sesion = await requireSesion("OPERARIO");
  if (!sesion) redirect("/");
  return children;
}
