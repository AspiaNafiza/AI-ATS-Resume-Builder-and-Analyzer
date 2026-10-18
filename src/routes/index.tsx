import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader } from "@/components/app/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATS Resume Suite — Resume, CV & Cover Letter Tools" },
      {
        name: "description",
        content:
          "Write ATS-friendly resumes, CVs and cover letters, then score them against a job description in seconds.",
      },
      { property: "og:title", content: "ATS Resume Suite" },
      {
        property: "og:description",
        content: "Job-seeker tools to build and check resumes, CVs and cover letters for ATS.",
      },
    ],
  }),
  component: Index,
});

const builders = [
  {
    slug: "resume",
    title: "Resume builder",
    copy: "A one- to two-page resume with a summary, skills, and action-verb bullets.",
  },
  {
    slug: "cv",
    title: "CV builder",
    copy: "Academic and research CV with publications, teaching and grants kept readable.",
  },
  {
    slug: "cover-letter",
    title: "Cover letter builder",
    copy: "Three to four tailored paragraphs written for the role, no filler.",
  },
] as const;

const analyzers = [
  { slug: "resume", title: "Resume analyzer" },
  { slug: "cv", title: "CV analyzer" },
  { slug: "cover-letter", title: "Cover letter analyzer" },
] as const;

function Index() {
  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-10 py-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              For job seekers
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              Documents that get past the screening software.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              Draft a resume, CV or cover letter from your own details, then check it against the
              job description for keyword, skill and experience gaps before you apply.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/builder/$type"
                params={{ type: "resume" }}
                className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Build a resume
              </Link>
              <Link
                to="/analyzer/$type"
                params={{ type: "resume" }}
                className="rounded-sm border border-input px-5 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Analyze a document
              </Link>
            </div>
          </div>

          <div className="border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What gets checked
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                "Section structure a parser can read",
                "Exact and semantic keyword coverage",
                "Hard and soft skill matching",
                "Experience relevance to the posting",
                "Action verbs and readability",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-accent">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeader
          eyebrow="Builders"
          title="Start from your own details"
          description="Paste what you have. Nothing is invented — empty inputs stay empty."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {builders.map((b) => (
            <Link
              key={b.slug}
              to="/builder/$type"
              params={{ type: b.slug }}
              className="border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <h3 className="text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.copy}</p>
              <p className="mt-4 text-sm font-medium text-primary">Open builder →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container-page py-16">
          <SectionHeader
            eyebrow="Analyzer"
            title="Score a document against a posting"
            description="Paste the document and the job description to get a score, matched and missing terms, and short fixes."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {analyzers.map((a) => (
              <Link
                key={a.slug}
                to="/analyzer/$type"
                params={{ type: a.slug }}
                className="flex items-center justify-between border border-border bg-card px-5 py-4 text-sm font-medium transition-colors hover:border-primary/50"
              >
                {a.title}
                <span className="text-primary">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
