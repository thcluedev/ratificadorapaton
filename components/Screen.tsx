export function Screen({
  header,
  footer,
  children,
  wide = false,
}: {
  header: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-fondo">
      <header className="no-print sticky top-0 z-20 flex h-[92px] shrink-0 items-center border-b-[3px] border-tinta bg-fondo px-6">
        {header}
      </header>
      <main
        className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-6 py-6 ${
          wide ? "" : "mx-auto w-full max-w-[1920px]"
        }`}
      >
        {children}
      </main>
      {footer ? (
        <footer className="no-print sticky bottom-0 z-20 shrink-0 border-t-[3px] border-tinta bg-fondo">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
