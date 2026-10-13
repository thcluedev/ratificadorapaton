export function OrderRow({
  numero,
  top,
  title,
  right,
  onClick,
}: {
  numero: number;
  top: string;
  title: string;
  right: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[92px] w-full items-center gap-4 rounded-[10px] border-[3px] border-tinta bg-fondo px-5 text-left"
    >
      <div className="min-w-0 flex-1">
        <div className="text-[18px] font-bold uppercase tracking-[0.06em] text-gris">
          {top ? `Orden ${numero} · ${top}` : `Orden ${numero}`}
        </div>
        <div className="mt-1 truncate text-[26px] font-bold leading-tight">{title}</div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {right}
        <span className="text-[32px] font-bold leading-none" aria-hidden>
          ›
        </span>
      </div>
    </button>
  );
}
