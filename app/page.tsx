import { prisma } from "@/lib/prisma";
import { LoginClient } from "./login-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const users = await prisma.user.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, rol: true },
    orderBy: { nombre: "asc" },
  });
  return <LoginClient users={users} />;
}
