import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/tanstack-react-start";
import { useServerFn } from "@tanstack/react-start";
import { getMyStats } from "@/lib/arie.functions";
import type { UserStats } from "@/lib/schemas";
import { slugToType } from "@/lib/doc-meta";

type Slug = "resume" | "cv" | "cover-letter";

const items: { slug: Slug; label: string }[] = [
  { slug: "resume", label: "Resume" },
  { slug: "cv", label: "CV" },
  { slug: "cover-letter", label: "Cover letter" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const getStats = useServerFn(getMyStats);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setStats(null);
      return;
    }
    let active = true;
    getStats()
      .then((res) => {
        if (active && res.ok) {
          setStats(res.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isSignedIn]);

  return (
    <header className="border-b border-border bg-background">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-serif text-lg font-semibold tracking-tight">ATS Resume Suite</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Built for applicant tracking systems
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavGroup title="Build" base="/builder/$type" stats={stats} />
          <NavGroup title="Analyze" base="/analyzer/$type" stats={stats} />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="rounded-sm border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>

        <button
          type="button"
          className="rounded-sm border border-input px-3 py-1.5 text-sm md:hidden"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface md:hidden">
          <div className="container-page grid gap-6 py-5">
            <MobileGroup title="Build" base="/builder/$type" stats={stats} onNavigate={() => setOpen(false)} />
            <MobileGroup title="Analyze" base="/analyzer/$type" stats={stats} onNavigate={() => setOpen(false)} />

            <div className="border-t border-border pt-4">
              <Show when="signed-out">
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="w-full rounded-sm border border-input bg-background px-3 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="w-full rounded-sm bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Sign up
                    </button>
                  </SignUpButton>
                </div>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Account</span>
                  <UserButton />
                </div>
              </Show>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function getBadge(slug: Slug, title: string, stats: UserStats | null) {
  if (!stats) return null;
  if (title === "Build") {
    const count =
      slug === "resume"
        ? stats.resumesCount
        : slug === "cv"
          ? stats.cvsCount
          : stats.coverLettersCount;
    if (count > 0) {
      return (
        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
          {count}
        </span>
      );
    }
  } else if (title === "Analyze") {
    const docType = slugToType(slug);
    const recent = stats.recentAnalyses.find((a) => a.target === docType);
    if (recent) {
      return (
        <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-primary">
          {recent.atsScore}%
        </span>
      );
    }
  }
  return null;
}

function NavGroup({
  title,
  base,
  stats,
}: {
  title: string;
  base: "/builder/$type" | "/analyzer/$type";
  stats: UserStats | null;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
      {items.map((item) => (
        <Link
          key={item.slug}
          to={base}
          params={{ type: item.slug }}
          className="flex items-center gap-1.5 text-foreground/80 underline-offset-4 hover:text-foreground hover:underline [&.active]:font-medium [&.active]:text-foreground"
        >
          <span>{item.label}</span>
          {getBadge(item.slug, title, stats)}
        </Link>
      ))}
    </div>
  );
}

function MobileGroup({
  title,
  base,
  stats,
  onNavigate,
}: {
  title: string;
  base: "/builder/$type" | "/analyzer/$type";
  stats: UserStats | null;
  onNavigate: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="mt-2 grid gap-2">
        {items.map((item) => (
          <Link
            key={item.slug}
            to={base}
            params={{ type: item.slug }}
            onClick={onNavigate}
            className="flex items-center justify-between text-sm"
          >
            <span>{item.label}</span>
            {getBadge(item.slug, title, stats)}
          </Link>
        ))}
      </div>
    </div>
  );
}
