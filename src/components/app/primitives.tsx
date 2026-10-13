import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold sm:text-[1.75rem]">{title}</h2>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function Panel({
  title,
  aside,
  children,
  className,
}: {
  title?: string | undefined;
  aside?: ReactNode;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section className={cn("border border-border bg-card", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
          {aside}
        </header>
      ) : null}
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

export function Tag({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "good" | "gap" | undefined;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-1 text-xs",
        tone === "neutral" && "border-border bg-secondary text-secondary-foreground",
        tone === "good" && "border-success/30 bg-success/10 text-success",
        tone === "gap" && "border-accent/30 bg-accent/10 text-accent",
      )}
    >
      {children}
    </span>
  );
}

export function TagList({
  items,
  tone,
  empty = "None found",
}: {
  items: string[];
  tone?: "neutral" | "good" | "gap" | undefined;
  empty?: string;
}) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Tag key={item} tone={tone}>
          {item}
        </Tag>
      ))}
    </div>
  );
}

export function ScoreCircle({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tone = clamped >= 75 ? "var(--success)" : clamped >= 50 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-24 w-24 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${tone} ${clamped * 3.6}deg, var(--border) 0deg)`,
        }}
      >
        <div className="grid h-[4.75rem] w-[4.75rem] place-items-center rounded-full bg-card">
          <span className="font-serif text-2xl font-semibold">{clamped}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">ATS score</p>
        <p className="text-sm text-muted-foreground">
          {clamped >= 75 ? "Strong match" : clamped >= 50 ? "Needs tightening" : "Major gaps"}
        </p>
      </div>
    </div>
  );
}

export function Loader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-border border-t-primary" />
      {label}
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}
