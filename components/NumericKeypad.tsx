const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Borrar"] as const;

export function NumericKeypad({
  onDigit,
  onBorrar,
}: {
  onDigit: (d: string) => void;
  onBorrar: () => void;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[420px] grid-cols-3 gap-3">
      {TECLAS.map((tecla) => {
        const isBorrar = tecla === "Borrar";
        const isCero = tecla === "0";
        return (
          <button
            key={tecla}
            type="button"
            onClick={() => (isBorrar ? onBorrar() : onDigit(tecla))}
            className={`min-h-[78px] rounded-[10px] border-[3px] border-tinta text-[27px] font-bold ${
              isBorrar ? "col-span-2 bg-fondo" : "bg-fondo"
            } ${isCero ? "" : ""}`}
          >
            {tecla}
          </button>
        );
      })}
    </div>
  );
}
