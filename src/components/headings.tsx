// Type hierarchy shared by every page: eyebrow label > serif title > sans body.

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">{title}</h1>
      {children && <p className="mt-3 max-w-xl leading-7 text-muted">{children}</p>}
    </header>
  );
}

export function SectionHeading({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      {children && <p className="mt-1 text-sm text-muted">{children}</p>}
    </div>
  );
}
