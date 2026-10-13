export function CheckRow({
  checked,
  label,
  right,
  onToggle,
  dashed = false,
  compact = false,
}: {
  checked: boolean;
  label: React.ReactNode;
  right?: React.ReactNode;
  onToggle: () => void;
  dashed?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-[10px] border-[3px] px-3 text-left ${
        compact ? "min-h-[56px] gap-2 px-3" : "min-h-[78px] gap-4 px-4"
      } ${dashed ? "border-dashed" : "border-solid"} ${
        checked ? "border-acento bg-acento/10" : "border-tinta bg-fondo"
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-[6px] border-[3px] font-bold ${
          compact ? "h-[30px] w-[30px] text-[18px]" : "h-[38px] w-[38px] text-[22px]"
        } ${checked ? "border-acento bg-acento text-fondo" : "border-tinta bg-fondo"}`}
        aria-hidden
      >
        {checked ? "✓" : ""}
      </span>
      <span
        className={`min-w-0 flex-1 font-bold leading-tight ${
          compact ? "text-[20px]" : "text-[26px]"
        }`}
      >
        {label}
      </span>
      {right ? <span className="shrink-0">{right}</span> : null}
    </button>
  );
}
