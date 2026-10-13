"use client";

import { useRouter } from "next/navigation";
import { OrderRow } from "@/components/OrderRow";

export function OperarioList({
  ordenes,
}: {
  ordenes: { numero: number; motor: string; material: string }[];
}) {
  const router = useRouter();
  if (ordenes.length === 0) {
    return <p className="text-[24px] text-gris">No hay motores esperando medición.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {ordenes.map((o) => (
        <OrderRow
          key={o.numero}
          numero={o.numero}
          top=""
          title={o.motor}
          right={<span className="text-[20px] font-bold text-gris">{o.material}</span>}
          onClick={() => router.push(`/operario/orden/${o.numero}`)}
        />
      ))}
    </div>
  );
}
