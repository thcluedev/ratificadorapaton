type Variant = "primary" | "secondary" | "ghost" | "accent";

const styles: Record<Variant, string> = {
  primary: "bg-tinta text-fondo border-tinta",
  secondary: "bg-fondo text-tinta border-tinta",
  ghost: "bg-transparent text-tinta border-transparent",
  accent: "bg-acento text-fondo border-acento",
};

export function BigButton({
  children,
  variant = "primary",
  className = "",
  pending = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  pending?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || pending}
      className={`inline-flex min-h-[78px] items-center justify-center rounded-[10px] border-[3px] px-6 text-[27px] font-bold leading-none disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {pending ? "Esperá…" : children}
    </button>
  );
}
