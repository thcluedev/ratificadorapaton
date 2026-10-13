import { requireSesion } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sesion = await requireSesion("ADMIN");
  if (!sesion) redirect("/");
  return children;
}
