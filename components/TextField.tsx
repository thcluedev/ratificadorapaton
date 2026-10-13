export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[18px] font-bold uppercase tracking-[0.08em] text-gris">
      {children}
    </div>
  );
}

export function TextField({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-[78px] w-full rounded-[10px] border-[3px] border-tinta bg-fondo px-4 text-[26px] outline-none placeholder:text-gris ${className}`}
    />
  );
}

export function TextArea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[78px] w-full resize-none rounded-[10px] border-[3px] border-tinta bg-fondo px-4 py-3 text-[22px] outline-none placeholder:text-gris ${className}`}
    />
  );
}
