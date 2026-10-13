import { prisma } from "./prisma";

export async function siguienteNumeroOrden() {
  const ultima = await prisma.orden.findFirst({
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  return (ultima?.numero ?? 0) + 1;
}
