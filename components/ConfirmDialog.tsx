import { BigButton } from "./BigButton";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancelar",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-fondo px-8 py-10">
      <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col justify-center">
        <h2 className="text-[32px] font-bold leading-tight">{title}</h2>
        <p className="mt-6 text-[24px] leading-snug text-gris">{body}</p>
        <div className="mt-12 flex gap-4">
          <BigButton variant="secondary" className="flex-1" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </BigButton>
          <BigButton className="flex-1" pending={pending} onClick={onConfirm}>
            {confirmLabel}
          </BigButton>
        </div>
      </div>
    </div>
  );
}
