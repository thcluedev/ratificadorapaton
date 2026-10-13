"use client";

import { useRouter } from "next/navigation";
import type { EstadoOrden } from "@/lib/types";
import { OrderRow } from "@/components/OrderRow";
import { StatusPill } from "@/components/StatusPill";

export function OrdenesList({
  ordenes,
}: {
  ordenes: { numero: number; cliente: string; motor: string; estado: EstadoOrden }[];
}) {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-3">
      {ordenes.length === 0 ? (
        <p className="text-[24px] text-gris">No hay órdenes abiertas.</p>
      ) : (
        ordenes.map((o) => (
          <OrderRow
            key={o.numero}
            numero={o.numero}
            top={o.cliente}
            title={o.motor}
            right={<StatusPill estado={o.estado} />}
            onClick={() => {
              if (o.estado === "MEDIDA") {
                router.push(`/admin/orden/${o.numero}/presupuesto?from=ordenes`);
              } else if (o.estado === "PRESUPUESTADA") {
                router.push(`/admin/orden/${o.numero}/comprobante?from=ordenes`);
              } else {
                router.push(`/admin/orden/${o.numero}`);
              }
            }}
          />
        ))
      )}
    </div>
  );
}
