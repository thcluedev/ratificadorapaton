import { prisma } from "@/lib/prisma";
import { getSesion } from "@/lib/auth";
import { salir } from "@/app/actions/auth";
import { conteoMaterial, motorConBlock, motorTexto } from "@/lib/labels";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { OperarioList } from "./operario-list";

export const dynamic = "force-dynamic";

export default async function OperarioHomePage() {
  const sesion = await getSesion();
  const ordenes = await prisma.orden.findMany({
    where: { estado: { in: ["PENDIENTE_MEDICION", "EN_MEDICION"] } },
    include: { cliente: true, archivos: true },
    orderBy: { numero: "asc" },
  });

  const filas = ordenes.map((o) => {
    const fotos = o.archivos.filter((a) => a.tipo === "FOTO").length;
    const videos = o.archivos.filter((a) => a.tipo === "VIDEO").length;
    return {
      numero: o.numero,
      motor: motorConBlock(o.numeroBlock, motorTexto(o.motorMarca, o.motorModelo)),
      material: conteoMaterial(fotos, videos),
    };
  });

  return (
    <Screen
      header={
        <Header
          title="Pendientes de medir"
          context={
            <form action={salir}>
              <button type="submit" className="text-[20px] font-bold text-tinta">
                Salir
              </button>
            </form>
          }
        />
      }
    >
      <p className="mb-4 text-[20px] text-gris">Hola, {sesion?.nombre}</p>
      <OperarioList ordenes={filas} />
    </Screen>
  );
}
