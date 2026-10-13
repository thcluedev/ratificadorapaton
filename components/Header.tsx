"use client";

import { useRouter } from "next/navigation";

export function Header({
  title,
  context,
  atrasHref,
  onAtras,
}: {
  title: React.ReactNode;
  context?: React.ReactNode;
  atrasHref?: string;
  onAtras?: () => void;
}) {
  const router = useRouter();

  function volver() {
    if (onAtras) {
      onAtras();
      return;
    }
    if (atrasHref) {
      router.push(atrasHref);
    }
  }

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="min-w-0 text-[28px] font-bold leading-tight">{title}</div>
      <div className="flex shrink-0 items-center gap-4">
        {context ? <div className="text-right text-[20px] text-gris">{context}</div> : null}
        {atrasHref || onAtras ? (
          <button
            type="button"
            onClick={volver}
            className="inline-flex min-h-[78px] min-w-[120px] items-center justify-center rounded-[10px] border-[3px] border-tinta bg-fondo px-5 text-[20px] font-bold text-tinta"
          >
            Atrás
          </button>
        ) : null}
      </div>
    </div>
  );
}
