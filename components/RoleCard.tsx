export function RoleCard({
  title,
  subtitle,
  selected = false,
  onClick,
}: {
  title: string;
  subtitle: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[220px] flex-1 flex-col items-start justify-end rounded-[10px] border-[3px] p-8 text-left ${
        selected ? "border-acento bg-acento/10" : "border-tinta bg-fondo"
      }`}
    >
      <div className="text-[32px] font-bold leading-none">{title}</div>
      <div className="mt-4 text-[20px] text-gris">{subtitle}</div>
    </button>
  );
}
