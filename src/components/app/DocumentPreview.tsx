import type { AdditionalEntry, BuilderResult, CertificationEntry, PersonalInfo } from "@/lib/schemas";
import { normalizeDoc } from "@/components/app/DocumentEditor";

function certificationText(entry: CertificationEntry) {
  return [entry.name, entry.issuer, entry.period].filter(Boolean).join(" — ");
}

function additionalText(entry: AdditionalEntry) {
  const heading = [entry.type, entry.title].filter(Boolean).join(": ");
  const context = [entry.organization, entry.period].filter(Boolean).join(" · ");
  return [heading, context, entry.details].filter(Boolean).join(" — ");
}

export function formatPeriod(startDate?: string, endDate?: string, fallbackPeriod?: string): string {
  const start = (startDate ?? "").trim();
  const end = (endDate ?? "").trim();
  if (start && end) return `${start} – ${end}`;
  if (start && !end) return `${start} – Present`;
  if (!start && end) return end;
  return (fallbackPeriod ?? "").trim();
}

export function toPlainText(doc: BuilderResult) {
  const safeDoc = normalizeDoc(doc);
  const p = safeDoc.personal;
  const s = safeDoc.sections;
  const lines: string[] = [];

  if (doc.document_type === "cover_letter") {
    if (s.cover_letter) {
      lines.push(s.cover_letter);
    } else {
      if (p && (p.fullName || p.headline || p.email || p.phone || p.location || p.website || p.github || p.linkedin)) {
        if (p.fullName) lines.push(p.fullName.toUpperCase());
        if (p.headline) lines.push(p.headline);
        const line1 = [p.email, p.phone, p.location, p.website].filter(Boolean).join(" | ");
        if (line1) lines.push(line1);
        lines.push("");
      }
      if (s.summary) lines.push(s.summary, "");
      s.extra.forEach((entry) => lines.push(entry.details, ""));
    }
    if (s.attachments && s.attachments.length) {
      lines.push("", "ATTACHMENTS & ENCLOSURES");
      s.attachments.forEach((entry) => lines.push(`- ${entry}`));
    }
    return lines.join("\n").trim();
  }

  // CV Cover Letter prefix
  if (doc.document_type === "cv" && s.cover_letter) {
    lines.push("==================================================");
    lines.push("COVER LETTER (INCLUDED WITH CV)");
    lines.push("==================================================");
    lines.push(s.cover_letter, "");
    lines.push("==================================================");
    lines.push("CURRICULUM VITAE");
    lines.push("==================================================");
    lines.push("");
  }

  if (p && (p.fullName || p.headline || p.email || p.phone || p.location || p.website || p.github || p.linkedin)) {
    if (p.fullName) lines.push(p.fullName.toUpperCase());
    if (p.headline) lines.push(p.headline);
    const line1 = [p.email, p.phone, p.location, p.website].filter(Boolean).join(" | ");
    if (line1) lines.push(line1);
    const line2 = [
      p.github ? `GitHub: ${p.github}` : "",
      p.linkedin ? `LinkedIn: ${p.linkedin}` : "",
    ].filter(Boolean).join(" | ");
    if (line2) lines.push(line2);
    lines.push("");
  }

  if (s.summary) lines.push("PROFESSIONAL SUMMARY", s.summary, "");
  if (s.skills.length) lines.push("SKILLS", s.skills.join(", "), "");
  if (s.experience.length) {
    lines.push("EXPERIENCE");
    s.experience.forEach((entry) => {
      const dates = formatPeriod(entry.startDate, entry.endDate, entry.period);
      const heading = [entry.title, entry.organization].filter(Boolean).join(" — ");
      lines.push(dates ? `${heading} (${dates})` : heading);
      entry.bullets.forEach((bullet) => lines.push(`- ${bullet}`));
      lines.push("");
    });
  }
  if (s.education.length) {
    lines.push("EDUCATION");
    s.education.forEach((entry) => {
      const dates = formatPeriod(entry.startDate, entry.endDate, entry.period);
      const heading = [entry.credential, entry.institution].filter(Boolean).join(" — ");
      lines.push(dates ? `${heading} (${dates})` : heading);
    });
    lines.push("");
  }
  if (s.certifications.length) {
    lines.push("CERTIFICATIONS", ...s.certifications.map((entry) => `- ${certificationText(entry)}`), "");
  }
  if (s.languages && s.languages.length) {
    lines.push("LANGUAGES");
    lines.push(
      s.languages
        .map((entry) => (entry.proficiency ? `${entry.language} (${entry.proficiency})` : entry.language))
        .join(" · "),
      ""
    );
  }
  if (s.extra.length) lines.push("ADDITIONAL", ...s.extra.map((entry) => `- ${additionalText(entry)}`), "");
  if (s.references && s.references.length) {
    lines.push("REFERENCES");
    s.references.forEach((entry) => {
      lines.push([entry.name, entry.title, entry.organization].filter(Boolean).join(" — "));
      const details = [entry.relationship, entry.email, entry.phone].filter(Boolean).join(" · ");
      if (details) lines.push(details);
      lines.push("");
    });
  }
  if (s.attachments && s.attachments.length) {
    lines.push("ATTACHMENTS & ENCLOSURES");
    s.attachments.forEach((entry) => lines.push(`- ${entry}`));
    lines.push("");
  }
  return lines.join("\n").trim();
}

function PersonalHeader({ personal }: { personal?: PersonalInfo | undefined }) {
  if (!personal) return null;
  const p = personal;
  const hasAny = Boolean(
    p.fullName || p.headline || p.email || p.phone || p.location || p.website || p.github || p.linkedin
  );
  if (!hasAny) return null;

  const contactLine1 = [p.email, p.phone, p.location, p.website].filter(Boolean);
  const contactLine2 = [
    p.github ? `GitHub: ${p.github}` : "",
    p.linkedin ? `LinkedIn: ${p.linkedin}` : "",
  ].filter(Boolean);

  return (
    <header className="border-b border-border pb-5 text-center">
      {p.fullName ? (
        <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
          {p.fullName}
        </h1>
      ) : null}
      {p.headline ? (
        <p className="mt-1 text-sm font-medium text-foreground/85 sm:text-base">
          {p.headline}
        </p>
      ) : null}
      {contactLine1.length ? (
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
          {contactLine1.join(" | ")}
        </p>
      ) : null}
      {contactLine2.length ? (
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {contactLine2.join(" | ")}
        </p>
      ) : null}
    </header>
  );
}

export function DocumentPreview({ doc }: { doc: BuilderResult }) {
  const safeDoc = normalizeDoc(doc);
  const s = safeDoc.sections;

  if (safeDoc.document_type === "cover_letter") {
    return (
      <article className="space-y-5 text-sm leading-relaxed">
        {s.cover_letter ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {s.cover_letter}
          </div>
        ) : (
          <>
            <PersonalHeader personal={safeDoc.personal} />
            {s.summary ? <p className="font-medium text-foreground">{s.summary}</p> : null}
            {s.extra.map((entry, index) => (
              <p key={index}>{entry.details}</p>
            ))}
            {s.skills.length ? (
              <div className="pt-2 text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider">Key Skills:</span>{" "}
                {s.skills.join(" · ")}
              </div>
            ) : null}
          </>
        )}

        {s.attachments && s.attachments.length ? (
          <div className="border-t border-border pt-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Enclosures & Attachments
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              {s.attachments.map((entry, index) => (
                <li key={index}>
                  <span className="text-foreground">{entry}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article className="space-y-6 text-sm leading-relaxed">
      {/* Integrated Cover Letter for CV */}
      {safeDoc.document_type === "cv" && s.cover_letter ? (
        <section className="mb-6 rounded-md border border-border/80 bg-secondary/25 p-5">
          <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cover Letter (Included with CV)
            </span>
            <span className="text-[11px] text-muted-foreground">Page 1 in PDF</span>
          </div>
          <div className="whitespace-pre-wrap text-xs leading-relaxed text-foreground sm:text-sm">
            {s.cover_letter}
          </div>
        </section>
      ) : null}

      {safeDoc.document_type === "cv" && s.cover_letter ? (
        <div className="my-6 border-b-2 border-dashed border-border text-center">
          <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            Curriculum Vitae Body
          </span>
        </div>
      ) : null}

      <PersonalHeader personal={safeDoc.personal} />
      {s.summary ? <Block title="Professional summary"><p>{s.summary}</p></Block> : null}
      {s.skills.length ? <Block title="Skills"><p>{s.skills.join(" · ")}</p></Block> : null}
      {s.experience.length ? (
        <Block title="Experience">
          <div className="space-y-4">
            {s.experience.map((entry, index) => {
              const dates = formatPeriod(entry.startDate, entry.endDate, entry.period);
              return (
                <div key={index}>
                  <p className="font-medium">
                    {entry.title}
                    {entry.organization ? `, ${entry.organization}` : ""}
                  </p>
                  {dates ? <p className="text-xs text-muted-foreground">{dates}</p> : null}
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {entry.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Block>
      ) : null}
      {s.education.length ? (
        <Block title="Education">
          <div className="space-y-2">
            {s.education.map((entry, index) => {
              const dates = formatPeriod(entry.startDate, entry.endDate, entry.period);
              return (
                <div key={index}>
                  <p className="font-medium">{entry.credential}</p>
                  <p className="text-xs text-muted-foreground">
                    {[entry.institution, dates].filter(Boolean).join(" · ")}
                  </p>
                </div>
              );
            })}
          </div>
        </Block>
      ) : null}
      {s.certifications.length ? (
        <Block title="Certifications">
          <div className="space-y-2">
            {s.certifications.map((entry, index) => (
              <div key={index}>
                <p className="font-medium">{entry.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[entry.issuer, entry.period].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </Block>
      ) : null}
      {s.languages && s.languages.length ? (
        <Block title="Languages">
          <p>
            {s.languages
              .map((entry) =>
                entry.proficiency ? `${entry.language} (${entry.proficiency})` : entry.language
              )
              .join(" · ")}
          </p>
        </Block>
      ) : null}
      {s.extra.length ? (
        <Block title={safeDoc.document_type === "cv" ? "Publications, grants & projects" : "Additional"}>
          <div className="space-y-3">
            {s.extra.map((entry, index) => (
              <div key={index}>
                <p className="font-medium">{[entry.type, entry.title].filter(Boolean).join(": ")}</p>
                {entry.organization || entry.period ? (
                  <p className="text-xs text-muted-foreground">
                    {[entry.organization, entry.period].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                {entry.details ? <p className="mt-1">{entry.details}</p> : null}
              </div>
            ))}
          </div>
        </Block>
      ) : null}
      {s.references && s.references.length ? (
        <Block title="References">
          <div className="space-y-3">
            {s.references.map((entry, index) => (
              <div key={index}>
                <p className="font-medium">
                  {entry.name}
                  {entry.title || entry.organization
                    ? ` — ${[entry.title, entry.organization].filter(Boolean).join(", ")}`
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[entry.relationship, entry.email, entry.phone].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </Block>
      ) : null}
      {s.attachments && s.attachments.length ? (
        <Block title="Attachments & Enclosures">
          <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {s.attachments.map((entry, index) => (
              <li key={index}>
                <span className="text-foreground">{entry}</span>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}
    </article>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h4 className="mb-2 border-b border-border pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>{children}</section>;
}