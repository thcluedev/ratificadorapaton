import { formatDuracion } from "@/lib/labels";

export function MediaThumb({
  url,
  tipo,
  duracionSeg,
  onClick,
}: {
  url: string;
  tipo: "FOTO" | "VIDEO";
  duracionSeg?: number | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative aspect-square overflow-hidden rounded-[10px] border-[3px] border-tinta bg-tinta/5"
    >
      {tipo === "FOTO" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <video src={url} className="h-full w-full object-cover" muted playsInline />
      )}
      {tipo === "VIDEO" ? (
        <span className="absolute bottom-2 right-2 rounded-[8px] border-[3px] border-tinta bg-fondo px-2 py-1 text-[18px] font-bold">
          {duracionSeg ? formatDuracion(duracionSeg) : "Video"}
        </span>
      ) : null}
    </button>
  );
}
