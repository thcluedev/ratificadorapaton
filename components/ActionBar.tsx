export function ActionBar({
  left,
  right,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-4 px-6 py-4">
      <div className="flex min-w-0 flex-1 items-center">{left}</div>
      <div className="flex shrink-0 items-center justify-end gap-4">{right}</div>
    </div>
  );
}
