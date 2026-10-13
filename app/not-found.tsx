import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-8">
      <h1 className="text-[32px] font-bold">No encontramos esa pantalla</h1>
      <p className="text-[22px] text-gris">Volvé al inicio y elegí de nuevo.</p>
      <Link
        href="/"
        className="inline-flex min-h-[78px] items-center rounded-[10px] border-[3px] border-tinta bg-tinta px-8 text-[27px] font-bold text-fondo"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
