import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, FileText, Loader2, Plus, Sparkles, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  AdditionalEntry,
  BuilderResult,
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  PersonalInfo,
  ReferenceEntry,
} from "@/lib/schemas";
import { formatPeriod } from "@/components/app/DocumentPreview";

type Sections = BuilderResult["sections"];

export const PROFICIENCY_LEVELS = [
  "Native / Bilingual",
  "Fluent",
  "Professional Working",
  "Intermediate / Conversational",
  "Elementary / Basic",
] as const;

export const blankLanguage = (): LanguageEntry => ({
  language: "",
  proficiency: "Professional Working",
});

export const blankPersonal = (): PersonalInfo => ({
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  github: "",
  linkedin: "",
});

export const blankReference = (): ReferenceEntry => ({
  name: "",
  title: "",
  organization: "",
  email: "",
  phone: "",
  relationship: "",
});

export const COMMON_ATTACHMENTS = [
  "Academic Transcripts",
  "Letters of Recommendation (2)",
  "Degree Certificate",
  "Portfolio & Project Samples",
  "Writing Sample / Published Papers",
  "Professional Certifications",
];

export function getDefaultCoverLetter(personal?: PersonalInfo): string {
  const p = personal || blankPersonal();
  const name = p.fullName?.trim() || "[Your Full Name]";
  const contactParts = [
    p.location?.trim() || "[City, State ZIP]",
    p.phone?.trim() || "[Phone]",
    p.email?.trim() || "[Email]",
    p.linkedin?.trim() || "[LinkedIn URL]",
  ].filter(Boolean);
  const contactLine = contactParts.join(" | ");

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `${name}

${contactLine}

${today}

Dear [Hiring Manager's name, or "Hiring Team" if the posting does not name one],

I am applying for the [exact job title as written in the posting] role at [Company]. I am a [your current title] with [X] years in [field], and [one sentence naming the posting's single hardest requirement and the evidence you have for it].

In my current role at [Current Company], I [specific accomplishment that uses two or three terms from the posting, with a number attached]. Before that, I [second accomplishment covering a different requirement from the posting, also with a number]. Both map directly to [requirement quoted from the posting].

[Optional, one sentence: something specific about this employer - a product, a market, a recent change - that explains why this job rather than any job. Delete this line rather than filling it with a compliment.]

I would welcome the chance to talk about [team, product or goal named in the posting]. Thank you for your time.

Sincerely,

${name}`;
}

const blankCertification = (): CertificationEntry => ({ name: "", issuer: "", period: "" });
const blankAdditional = (): AdditionalEntry => ({ type: "", title: "", organization: "", period: "", details: "" });

export function parseLegacyDates(
  startDate?: string,
  endDate?: string,
  legacyPeriod?: string
): { startDate: string; endDate: string } {
  let start = (startDate ?? "").trim();
  let end = (endDate ?? "").trim();
  if (!start && !end && legacyPeriod) {
    const raw = legacyPeriod.trim();
    const parts = raw.split(/\s*(?:–|—|-|\bto\b)\s*/i);
    if (parts.length === 2 && parts[0] && parts[1]) {
      start = parts[0];
      const second = parts[1];
      end = second.toLowerCase() === "present" || second.toLowerCase() === "current" ? "" : second;
    } else {
      start = raw;
    }
  }
  return { startDate: start, endDate: end };
}

export function emptyDoc(type: BuilderResult["document_type"]): BuilderResult {
  const p = blankPersonal();
  return {
    document_type: type,
    personal: p,
    sections: {
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      extra: [],
      languages: [],
      references: [],
      attachments: [],
      cover_letter: type === "cv" || type === "cover_letter" ? getDefaultCoverLetter(p) : "",
    },
  };
}

export function normalizeLegacyDoc(value: unknown, fallbackType: BuilderResult["document_type"]): BuilderResult {
  if (!value || typeof value !== "object") return emptyDoc(fallbackType);
  const raw = value as { document_type?: unknown; personal?: unknown; sections?: Record<string, unknown> };
  const sections = raw.sections && typeof raw.sections === "object" ? raw.sections : {};
  const stringValue = (item: unknown) => (typeof item === "string" ? item : "");
  const arrayValue = (item: unknown) => (Array.isArray(item) ? item : []);

  const rawPersonal = raw.personal;
  const personalEntry = rawPersonal && typeof rawPersonal === "object" ? (rawPersonal as Record<string, unknown>) : {};
  const personal: PersonalInfo = {
    fullName: stringValue(personalEntry["fullName"]),
    headline: stringValue(personalEntry["headline"]),
    email: stringValue(personalEntry["email"]),
    phone: stringValue(personalEntry["phone"]),
    location: stringValue(personalEntry["location"]),
    website: stringValue(personalEntry["website"]),
    github: stringValue(personalEntry["github"]),
    linkedin: stringValue(personalEntry["linkedin"]),
  };

  const skills = Array.isArray(sections["skills"])
    ? (sections["skills"] as unknown[]).map(stringValue).filter(Boolean)
    : typeof sections["skills"] === "string"
      ? (sections["skills"] as string).split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const experience = arrayValue(sections["experience"]).map((item): ExperienceEntry => {
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const rawBullets = entry["bullets"];
    const bullets = Array.isArray(rawBullets)
      ? (rawBullets as unknown[]).map(stringValue).filter(Boolean)
      : typeof rawBullets === "string"
        ? (rawBullets as string).split("\n").map((b) => b.trim()).filter(Boolean)
        : [];
    const parsed = parseLegacyDates(
      stringValue(entry["startDate"]),
      stringValue(entry["endDate"]),
      stringValue(entry["period"])
    );
    const startDate = stringValue(entry["startDate"]) || parsed.startDate;
    const endDate = stringValue(entry["endDate"]) || parsed.endDate;
    return {
      title: stringValue(entry["title"]),
      organization: stringValue(entry["organization"]),
      startDate,
      endDate,
      period: formatPeriod(startDate, endDate, stringValue(entry["period"])),
      bullets,
    };
  });

  const education = arrayValue(sections["education"]).map((item): EducationEntry => {
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const parsed = parseLegacyDates(
      stringValue(entry["startDate"]),
      stringValue(entry["endDate"]),
      stringValue(entry["period"])
    );
    const startDate = stringValue(entry["startDate"]) || parsed.startDate;
    const endDate = stringValue(entry["endDate"]) || parsed.endDate;
    return {
      credential: stringValue(entry["credential"]),
      institution: stringValue(entry["institution"]),
      startDate,
      endDate,
      period: formatPeriod(startDate, endDate, stringValue(entry["period"])),
    };
  });

  const certifications = arrayValue(sections["certifications"]).map((item): CertificationEntry => {
    if (typeof item === "string") return { name: item, issuer: "", period: "" };
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return { name: stringValue(entry["name"]), issuer: stringValue(entry["issuer"]), period: stringValue(entry["period"]) };
  });

  const languages = arrayValue(sections["languages"]).map((item): LanguageEntry => {
    if (typeof item === "string") return { language: item, proficiency: "Professional Working" };
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      language: stringValue(entry["language"]),
      proficiency: stringValue(entry["proficiency"]) || "Professional Working",
    };
  });

  const extra = arrayValue(sections["extra"]).map((item): AdditionalEntry => {
    if (typeof item === "string") {
      return fallbackType === "cover_letter"
        ? { ...blankAdditional(), type: "Paragraph", details: item }
        : { ...blankAdditional(), title: item };
    }
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      type: stringValue(entry["type"]),
      title: stringValue(entry["title"]),
      organization: stringValue(entry["organization"]),
      period: stringValue(entry["period"]),
      details: stringValue(entry["details"]),
    };
  });

  const references = arrayValue(sections["references"]).map((item): ReferenceEntry => {
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      name: stringValue(entry["name"]),
      title: stringValue(entry["title"]),
      organization: stringValue(entry["organization"]),
      email: stringValue(entry["email"]),
      phone: stringValue(entry["phone"]),
      relationship: stringValue(entry["relationship"]),
    };
  });

  const attachments = Array.isArray(sections["attachments"])
    ? (sections["attachments"] as unknown[]).map(stringValue).filter(Boolean)
    : [];

  const cover_letter =
    stringValue(sections["cover_letter"]) ||
    (fallbackType === "cv" || fallbackType === "cover_letter" ? getDefaultCoverLetter(personal) : "");

  return {
    document_type:
      raw.document_type === "resume" || raw.document_type === "cv" || raw.document_type === "cover_letter"
        ? raw.document_type
        : fallbackType,
    personal,
    sections: {
      summary: stringValue(sections["summary"]),
      skills,
      experience,
      education,
      certifications,
      extra,
      languages,
      references,
      attachments,
      cover_letter,
    },
  };
}

/** Clean up raw editor values for preview, copy, and AI rewriting. */
export function normalizeDoc(doc: BuilderResult): BuilderResult {
  const safeStr = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const clean = (items: unknown) =>
    Array.isArray(items)
      ? items.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
      : [];

  const s = doc?.sections ?? {
    summary: "",
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    extra: [],
    languages: [],
    references: [],
    attachments: [],
    cover_letter: "",
  };
  const p = doc?.personal ?? blankPersonal();
  return {
    document_type: doc?.document_type ?? "resume",
    personal: {
      fullName: safeStr(p?.fullName),
      headline: safeStr(p?.headline),
      email: safeStr(p?.email),
      phone: safeStr(p?.phone),
      location: safeStr(p?.location),
      website: safeStr(p?.website),
      github: safeStr(p?.github),
      linkedin: safeStr(p?.linkedin),
    },
    sections: {
      summary: safeStr(s.summary),
      skills: clean(s.skills),
      experience: (Array.isArray(s.experience) ? s.experience : [])
        .map((entry) => {
          const parsed = parseLegacyDates(entry?.startDate, entry?.endDate, entry?.period);
          const startDate = safeStr(entry?.startDate !== undefined ? entry.startDate : parsed.startDate);
          const endDate = safeStr(entry?.endDate !== undefined ? entry.endDate : parsed.endDate);
          const period = formatPeriod(startDate, endDate, safeStr(entry?.period));
          return {
            title: safeStr(entry?.title),
            organization: safeStr(entry?.organization),
            startDate,
            endDate,
            period,
            bullets: clean(entry?.bullets),
          };
        })
        .filter((entry) => entry.title || entry.organization || entry.bullets.length),
      education: (Array.isArray(s.education) ? s.education : [])
        .map((entry) => {
          const parsed = parseLegacyDates(entry?.startDate, entry?.endDate, entry?.period);
          const startDate = safeStr(entry?.startDate !== undefined ? entry.startDate : parsed.startDate);
          const endDate = safeStr(entry?.endDate !== undefined ? entry.endDate : parsed.endDate);
          const period = formatPeriod(startDate, endDate, safeStr(entry?.period));
          return {
            credential: safeStr(entry?.credential),
            institution: safeStr(entry?.institution),
            startDate,
            endDate,
            period,
          };
        })
        .filter((entry) => entry.credential || entry.institution),
      certifications: (Array.isArray(s.certifications) ? s.certifications : [])
        .map((entry) => {
          if (typeof entry === "string") return { name: (entry as string).trim(), issuer: "", period: "" };
          return {
            name: safeStr(entry?.name),
            issuer: safeStr(entry?.issuer),
            period: safeStr(entry?.period),
          };
        })
        .filter((entry) => entry.name || entry.issuer),
      languages: (Array.isArray(s.languages) ? s.languages : [])
        .map((entry) => ({
          language: safeStr(entry?.language),
          proficiency: safeStr(entry?.proficiency),
        }))
        .filter((entry) => entry.language),
      extra: (Array.isArray(s.extra) ? s.extra : [])
        .map((entry) => {
          if (typeof entry === "string") {
            const isLetter = doc?.document_type === "cover_letter";
            return {
              type: isLetter ? "Paragraph" : "",
              title: isLetter ? "" : (entry as string).trim(),
              organization: "",
              period: "",
              details: isLetter ? (entry as string).trim() : "",
            };
          }
          return {
            type: safeStr(entry?.type),
            title: safeStr(entry?.title),
            organization: safeStr(entry?.organization),
            period: safeStr(entry?.period),
            details: safeStr(entry?.details),
          };
        })
        .filter((entry) => entry.title || entry.details),
      references: (Array.isArray(s.references) ? s.references : [])
        .map((entry) => ({
          name: safeStr(entry?.name),
          title: safeStr(entry?.title),
          organization: safeStr(entry?.organization),
          email: safeStr(entry?.email),
          phone: safeStr(entry?.phone),
          relationship: safeStr(entry?.relationship),
        }))
        .filter((entry) => entry.name || entry.organization || entry.email || entry.phone),
      attachments: clean(s.attachments),
      cover_letter: safeStr(s.cover_letter),
    },
  };
}

const field = "w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";
const label = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

/** Provide non-destructive safe defaults for live editing in DocumentEditor (does NOT trim whitespace). */
export function ensureEditorDoc(doc: BuilderResult): BuilderResult & { personal: PersonalInfo } {
  const stringVal = (v: unknown) => (typeof v === "string" ? v : "");
  const p = doc?.personal ? { ...blankPersonal(), ...doc.personal } : blankPersonal();
  const s = doc?.sections ?? {
    summary: "",
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    extra: [],
    languages: [],
    references: [],
    attachments: [],
    cover_letter: "",
  };

  const personal: PersonalInfo = {
    fullName: stringVal(p.fullName),
    headline: stringVal(p.headline),
    email: stringVal(p.email),
    phone: stringVal(p.phone),
    location: stringVal(p.location),
    website: stringVal(p.website),
    github: stringVal(p.github),
    linkedin: stringVal(p.linkedin),
  };

  return {
    document_type: doc?.document_type ?? "resume",
    personal,
    sections: {
      summary: stringVal(s.summary),
      skills: Array.isArray(s.skills) ? s.skills.map(stringVal) : [],
      experience: Array.isArray(s.experience)
        ? s.experience.map((entry) => {
            const parsed = parseLegacyDates(entry?.startDate, entry?.endDate, entry?.period);
            const startDate = stringVal(entry?.startDate !== undefined ? entry.startDate : parsed.startDate);
            const endDate = stringVal(entry?.endDate !== undefined ? entry.endDate : parsed.endDate);
            return {
              title: stringVal(entry?.title),
              organization: stringVal(entry?.organization),
              startDate,
              endDate,
              period: formatPeriod(startDate, endDate, stringVal(entry?.period)),
              bullets: Array.isArray(entry?.bullets) ? entry.bullets.map(stringVal) : [""],
            };
          })
        : [],
      education: Array.isArray(s.education)
        ? s.education.map((entry) => {
            const parsed = parseLegacyDates(entry?.startDate, entry?.endDate, entry?.period);
            const startDate = stringVal(entry?.startDate !== undefined ? entry.startDate : parsed.startDate);
            const endDate = stringVal(entry?.endDate !== undefined ? entry.endDate : parsed.endDate);
            return {
              credential: stringVal(entry?.credential),
              institution: stringVal(entry?.institution),
              startDate,
              endDate,
              period: formatPeriod(startDate, endDate, stringVal(entry?.period)),
            };
          })
        : [],
      certifications: Array.isArray(s.certifications)
        ? s.certifications.map((entry) => {
            if (typeof entry === "string") return { name: entry, issuer: "", period: "" };
            return {
              name: stringVal(entry?.name),
              issuer: stringVal(entry?.issuer),
              period: stringVal(entry?.period),
            };
          })
        : [],
      languages: Array.isArray(s.languages)
        ? s.languages.map((entry) => ({
            language: stringVal(entry?.language),
            proficiency: stringVal(entry?.proficiency) || "Professional Working",
          }))
        : [],
      extra: Array.isArray(s.extra)
        ? s.extra.map((entry) => {
            if (typeof entry === "string") {
              return { ...blankAdditional(), title: entry };
            }
            return {
              type: stringVal(entry?.type),
              title: stringVal(entry?.title),
              organization: stringVal(entry?.organization),
              period: stringVal(entry?.period),
              details: stringVal(entry?.details),
            };
          })
        : [],
      references: Array.isArray(s.references)
        ? s.references.map((entry) => ({
            name: stringVal(entry?.name),
            title: stringVal(entry?.title),
            organization: stringVal(entry?.organization),
            email: stringVal(entry?.email),
            phone: stringVal(entry?.phone),
            relationship: stringVal(entry?.relationship),
          }))
        : [],
      attachments: Array.isArray(s.attachments) ? s.attachments.map(stringVal) : [],
      cover_letter: stringVal(s.cover_letter),
    },
  };
}

export function DocumentEditor({
  doc,
  onChange,
  onRewriteSummary,
  isRewriting = false,
}: {
  doc: BuilderResult;
  onChange: (doc: BuilderResult) => void;
  onRewriteSummary?: (() => void) | undefined;
  isRewriting?: boolean | undefined;
}) {
  const liveDoc = ensureEditorDoc(doc);
  const s = liveDoc.sections;
  const p = liveDoc.personal;
  const set = (patch: Partial<Sections>) => onChange({ ...liveDoc, sections: { ...s, ...patch } });
  const updatePersonal = (patch: Partial<PersonalInfo>) => {
    const updatedPersonal: PersonalInfo = {
      fullName: patch.fullName !== undefined ? patch.fullName : p.fullName,
      headline: patch.headline !== undefined ? patch.headline : p.headline,
      email: patch.email !== undefined ? patch.email : p.email,
      phone: patch.phone !== undefined ? patch.phone : p.phone,
      location: patch.location !== undefined ? patch.location : p.location,
      website: patch.website !== undefined ? patch.website : p.website,
      github: patch.github !== undefined ? patch.github : p.github,
      linkedin: patch.linkedin !== undefined ? patch.linkedin : p.linkedin,
    };
    onChange({ ...liveDoc, personal: updatedPersonal });
  };
  const isLetter = liveDoc.document_type === "cover_letter";

  if (isLetter) {
    return (
      <div className="space-y-5">
        <PersonalSection personal={p} onChange={updatePersonal} />
        <div>
          <div className="flex items-center justify-between gap-3">
            <label className={label} htmlFor="ed-summary">
              Opening line
            </label>
            {onRewriteSummary ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-sm border-border px-2.5 text-xs font-medium hover:bg-secondary"
                disabled={!s.summary.trim() || isRewriting}
                onClick={onRewriteSummary}
                title="Improve opening line with AI"
              >
                {isRewriting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                    <span>Improving…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    <span>Improve with AI</span>
                  </>
                )}
              </Button>
            ) : null}
          </div>
          <input
            id="ed-summary"
            className={`${field} mt-1`}
            placeholder="e.g. I am writing to express my interest in the Senior Software Engineer role at Acme Corp."
            value={s.summary}
            onChange={(event) => set({ summary: event.target.value })}
          />
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className={label}>Letter paragraphs</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                const templ = getDefaultCoverLetter(p);
                const paragraphs = templ.split("\n\n").slice(3, -2);
                set({
                  cover_letter: templ,
                  extra: paragraphs.map((pGraph) => ({
                    ...blankAdditional(),
                    type: "Paragraph",
                    details: pGraph,
                  })),
                });
              }}
              title="Reset paragraphs to standard high-converting template"
            >
              Use standard template
            </Button>
          </div>
          <div className="mt-2 space-y-3">
            {s.extra.map((entry, index) => (
              <div key={index} className="flex items-start gap-2">
                <textarea
                  aria-label={`Paragraph ${index + 1}`}
                  rows={5}
                  placeholder={`Paragraph ${index + 1} content...`}
                  className={`${field} leading-relaxed`}
                  value={entry.details}
                  onChange={(event) =>
                    set({
                      extra: s.extra.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, type: "Paragraph", details: event.target.value } : item
                      ),
                    })
                  }
                />
                <IconRemove
                  label={`Remove paragraph ${index + 1}`}
                  onClick={() => set({ extra: s.extra.filter((_, itemIndex) => itemIndex !== index) })}
                />
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 rounded-sm"
            onClick={() => set({ extra: [...s.extra, { ...blankAdditional(), type: "Paragraph" }] })}
          >
            <Plus className="h-3.5 w-3.5" /> Add paragraph
          </Button>
        </div>

        {/* ATTACHMENTS & ENCLOSURES FOR COVER LETTER */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className={label}>Attachments & Enclosures</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 rounded-sm text-xs"
              onClick={() => set({ attachments: [...(s.attachments || []), ""] })}
            >
              <Plus className="h-3.5 w-3.5" /> Add attachment mention
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Mention documents or portfolio items enclosed with your cover letter.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="text-[11px] font-medium text-muted-foreground self-center mr-1">Quick add:</span>
            {COMMON_ATTACHMENTS.map((preset) => {
              const isAdded = (s.attachments || []).includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                    isAdded
                      ? "border-accent/40 bg-accent/10 text-accent font-medium"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  onClick={() => {
                    if (isAdded) {
                      set({ attachments: (s.attachments || []).filter((item) => item !== preset) });
                    } else {
                      set({ attachments: [...(s.attachments || []), preset] });
                    }
                  }}
                >
                  {isAdded ? "✓ " : "+ "}{preset}
                </button>
              );
            })}
          </div>
          <div className="mt-2 space-y-2">
            {(s.attachments || []).map((attachment, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  aria-label={`Attachment ${index + 1}`}
                  placeholder="Document name (e.g. Resume, Academic Transcripts, Writing Sample)"
                  className={field}
                  value={attachment}
                  onChange={(e) =>
                    set({
                      attachments: (s.attachments || []).map((item, itemIndex) =>
                        itemIndex === index ? e.target.value : item
                      ),
                    })
                  }
                />
                <IconRemove
                  label={`Remove attachment ${index + 1}`}
                  onClick={() =>
                    set({
                      attachments: (s.attachments || []).filter((_, itemIndex) => itemIndex !== index),
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const updateExperience = (index: number, patch: Partial<ExperienceEntry>) =>
    set({
      experience: s.experience.map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, ...patch } : entry
      ),
    });
  const updateEducation = (index: number, patch: Partial<EducationEntry>) =>
    set({
      education: s.education.map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, ...patch } : entry
      ),
    });
  const updateCertification = (index: number, patch: Partial<CertificationEntry>) =>
    set({
      certifications: s.certifications.map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, ...patch } : entry
      ),
    });
  const updateAdditional = (index: number, patch: Partial<AdditionalEntry>) =>
    set({
      extra: s.extra.map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, ...patch } : entry
      ),
    });
  const updateLanguage = (index: number, patch: Partial<LanguageEntry>) =>
    set({
      languages: (s.languages || []).map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, ...patch } : entry
      ),
    });
  const updateReference = (index: number, patch: Partial<ReferenceEntry>) =>
    set({
      references: (s.references || []).map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, ...patch } : entry
      ),
    });

  return (
    <div className="space-y-6">
      {/* COVER LETTER AS PART OF CV */}
      {liveDoc.document_type === "cv" ? (
        <div className="rounded-md border border-border bg-card p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Cover Letter (Included as Part of your CV)
              </h3>
              <p className="text-xs text-muted-foreground">
                Your CV application includes a tailored cover letter following the executive ATS standard pattern.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => set({ cover_letter: getDefaultCoverLetter(p) })}
              title="Reset cover letter to default template pattern"
            >
              Reset to standard pattern
            </Button>
          </div>
          <textarea
            rows={10}
            className={`${field} font-mono text-xs leading-relaxed`}
            placeholder={getDefaultCoverLetter(p)}
            value={s.cover_letter !== undefined && s.cover_letter !== "" ? s.cover_letter : getDefaultCoverLetter(p)}
            onChange={(event) => set({ cover_letter: event.target.value })}
          />
          <p className="text-[11px] text-muted-foreground">
            This cover letter appears at the start of your CV preview and exports as Page 1 in the downloaded PDF.
          </p>
        </div>
      ) : null}

      <PersonalSection personal={p} onChange={updatePersonal} />
      <div>
        <div className="flex items-center justify-between gap-3">
          <label className={label} htmlFor="ed-summary">
            Professional summary
          </label>
          {onRewriteSummary ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-sm border-border px-2.5 text-xs font-medium hover:bg-secondary"
              disabled={!s.summary.trim() || isRewriting}
              onClick={onRewriteSummary}
              title="Improve summary with AI in a single click"
            >
              {isRewriting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                  <span>Improving…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span>Improve with AI</span>
                </>
              )}
            </Button>
          ) : null}
        </div>
        <textarea
          id="ed-summary"
          rows={4}
          className={`${field} mt-1 leading-relaxed`}
          placeholder="Concise 2-4 sentence summary highlighting experience, primary domain, and key achievements."
          value={s.summary}
          onChange={(event) => set({ summary: event.target.value })}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Single-click &ldquo;Improve with AI&rdquo; to rewrite and strengthen this summary using your document facts.
        </p>
      </div>

      <SkillsInput skills={s.skills} onChange={(skills) => set({ skills })} />

      <EditorSection
        title="Experience"
        addLabel="Add role"
        onAdd={() =>
          set({
            experience: [
              ...s.experience,
              {
                title: "",
                organization: "",
                startDate: "",
                endDate: "",
                period: "",
                bullets: [""],
              },
            ],
          })
        }
      >
        {s.experience.map((entry, index) => (
          <div key={index} className="space-y-3 border-l-2 border-border pl-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                aria-label="Job title"
                placeholder="Job title (e.g. Senior Software Engineer)"
                className={field}
                value={entry.title}
                onChange={(event) => updateExperience(index, { title: event.target.value })}
              />
              <input
                aria-label="Organization"
                placeholder="Organization / Company (e.g. Acme Corp)"
                className={field}
                value={entry.organization}
                onChange={(event) => updateExperience(index, { organization: event.target.value })}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                aria-label="Experience start date"
                placeholder="Start date (e.g. Jan 2022)"
                className={field}
                value={entry.startDate ?? ""}
                onChange={(event) => updateExperience(index, { startDate: event.target.value })}
              />
              <div>
                <input
                  aria-label="Experience end date"
                  placeholder="End date (leave blank if Present)"
                  className={field}
                  value={entry.endDate ?? ""}
                  onChange={(event) => updateExperience(index, { endDate: event.target.value })}
                />
                {entry.startDate && !entry.endDate ? (
                  <span className="mt-1 block text-[11px] font-medium text-accent">
                    Currently working here (Present)
                  </span>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Action-verb bullet points
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 rounded-sm px-2 text-xs"
                  onClick={() => updateExperience(index, { bullets: [...entry.bullets, ""] })}
                >
                  <Plus className="h-3 w-3" /> Add bullet
                </Button>
              </div>

              {entry.bullets.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">
                  No bullets added yet. Click &ldquo;Add bullet&rdquo; above.
                </p>
              ) : null}

              {entry.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex items-start gap-2">
                  <span className="mt-2 select-none text-xs font-semibold text-muted-foreground">
                    •
                  </span>
                  <textarea
                    aria-label={`Experience bullet ${bulletIndex + 1}`}
                    placeholder="Action verb + context + measurable result (e.g., Designed CI/CD pipeline, reducing deploy times by 65%)."
                    rows={2}
                    className={`${field} resize-y font-normal leading-relaxed`}
                    value={bullet}
                    onChange={(event) =>
                      updateExperience(index, {
                        bullets: entry.bullets.map((item, itemIndex) =>
                          itemIndex === bulletIndex ? event.target.value : item
                        ),
                      })
                    }
                  />
                  <div className="flex flex-col gap-0.5 pt-0.5">
                    {bulletIndex > 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        aria-label={`Move bullet ${bulletIndex + 1} up`}
                        title="Move bullet up"
                        onClick={() => {
                          const newBullets = [...entry.bullets];
                          const current = newBullets[bulletIndex];
                          const prev = newBullets[bulletIndex - 1];
                          if (current !== undefined && prev !== undefined) {
                            newBullets[bulletIndex - 1] = current;
                            newBullets[bulletIndex] = prev;
                            updateExperience(index, { bullets: newBullets });
                          }
                        }}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                    {bulletIndex < entry.bullets.length - 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        aria-label={`Move bullet ${bulletIndex + 1} down`}
                        title="Move bullet down"
                        onClick={() => {
                          const newBullets = [...entry.bullets];
                          const current = newBullets[bulletIndex];
                          const next = newBullets[bulletIndex + 1];
                          if (current !== undefined && next !== undefined) {
                            newBullets[bulletIndex + 1] = current;
                            newBullets[bulletIndex] = next;
                            updateExperience(index, { bullets: newBullets });
                          }
                        }}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                    <IconRemove
                      label={`Remove bullet ${bulletIndex + 1}`}
                      onClick={() =>
                        updateExperience(index, {
                          bullets: entry.bullets.filter((_, itemIndex) => itemIndex !== bulletIndex),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => set({ experience: s.experience.filter((_, itemIndex) => itemIndex !== index) })}
            >
              Remove role
            </Button>
          </div>
        ))}
      </EditorSection>

      <EditorSection
        title="Education"
        addLabel="Add entry"
        onAdd={() =>
          set({
            education: [
              ...s.education,
              { credential: "", institution: "", startDate: "", endDate: "", period: "" },
            ],
          })
        }
      >
        {s.education.map((entry, index) => (
          <div key={index} className="space-y-2 border-l-2 border-border pl-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                aria-label="Degree"
                placeholder="Degree / Qualification (e.g. B.S. in Computer Science)"
                className={field}
                value={entry.credential}
                onChange={(event) => updateEducation(index, { credential: event.target.value })}
              />
              <input
                aria-label="Institution"
                placeholder="Institution / School (e.g. Stanford University)"
                className={field}
                value={entry.institution}
                onChange={(event) => updateEducation(index, { institution: event.target.value })}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                aria-label="Education start date"
                placeholder="Start date (e.g. 2018)"
                className={field}
                value={entry.startDate ?? ""}
                onChange={(event) => updateEducation(index, { startDate: event.target.value })}
              />
              <div>
                <input
                  aria-label="Education end date"
                  placeholder="End date (leave blank if Present)"
                  className={field}
                  value={entry.endDate ?? ""}
                  onChange={(event) => updateEducation(index, { endDate: event.target.value })}
                />
                {entry.startDate && !entry.endDate ? (
                  <span className="mt-1 block text-[11px] font-medium text-accent">
                    Currently studying here (Present)
                  </span>
                ) : null}
              </div>
              <IconRemove
                label="Remove education entry"
                onClick={() =>
                  set({ education: s.education.filter((_, itemIndex) => itemIndex !== index) })
                }
              />
            </div>
          </div>
        ))}
      </EditorSection>

      <EditorSection
        title="Certifications"
        addLabel="Add certification"
        onAdd={() => set({ certifications: [...s.certifications, blankCertification()] })}
      >
        {s.certifications.map((entry, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_8rem_auto]">
            <input
              aria-label="Certification name"
              placeholder="Certification (e.g. AWS Solutions Architect)"
              className={field}
              value={entry.name}
              onChange={(event) => updateCertification(index, { name: event.target.value })}
            />
            <input
              aria-label="Certification issuer"
              placeholder="Issuer (e.g. Amazon Web Services)"
              className={field}
              value={entry.issuer}
              onChange={(event) => updateCertification(index, { issuer: event.target.value })}
            />
            <input
              aria-label="Certification date"
              placeholder="Year (e.g. 2023)"
              className={field}
              value={entry.period}
              onChange={(event) => updateCertification(index, { period: event.target.value })}
            />
            <IconRemove
              label="Remove certification"
              onClick={() => set({ certifications: s.certifications.filter((_, itemIndex) => itemIndex !== index) })}
            />
          </div>
        ))}
      </EditorSection>

      <EditorSection
        title="Languages"
        addLabel="Add language"
        onAdd={() =>
          set({
            languages: [...(s.languages || []), blankLanguage()],
          })
        }
      >
        {(!s.languages || s.languages.length === 0) ? (
          <p className="text-xs italic text-muted-foreground">
            No languages added yet. Click &ldquo;Add language&rdquo; to add languages and proficiency.
          </p>
        ) : null}
        {(s.languages || []).map((entry, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              aria-label="Language name"
              placeholder="Language (e.g. English, Spanish, German)"
              className={field}
              value={entry.language}
              onChange={(event) => updateLanguage(index, { language: event.target.value })}
            />
            <select
              aria-label="Proficiency level"
              className={`${field} cursor-pointer`}
              value={entry.proficiency || "Professional Working"}
              onChange={(event) => updateLanguage(index, { proficiency: event.target.value })}
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
              {entry.proficiency && !PROFICIENCY_LEVELS.includes(entry.proficiency as any) ? (
                <option value={entry.proficiency}>{entry.proficiency}</option>
              ) : null}
            </select>
            <IconRemove
              label="Remove language"
              onClick={() =>
                set({
                  languages: (s.languages || []).filter((_, itemIndex) => itemIndex !== index),
                })
              }
            />
          </div>
        ))}
      </EditorSection>

      <EditorSection
        title={doc.document_type === "cv" ? "Publications, grants, teaching and awards" : "Projects and awards"}
        addLabel="Add item"
        onAdd={() => set({ extra: [...s.extra, blankAdditional()] })}
      >
        {s.extra.map((entry, index) => (
          <div key={index} className="space-y-2 border-l-2 border-border pl-3">
            <div className="grid gap-2 sm:grid-cols-[9rem_1fr_1fr_8rem_auto]">
              <input
                aria-label="Item type"
                placeholder={doc.document_type === "cv" ? "Publication / Grant" : "Project / Award"}
                className={field}
                value={entry.type}
                onChange={(event) => updateAdditional(index, { type: event.target.value })}
              />
              <input
                aria-label="Item title"
                placeholder="Title / Name"
                className={field}
                value={entry.title}
                onChange={(event) => updateAdditional(index, { title: event.target.value })}
              />
              <input
                aria-label="Item organization"
                placeholder="Organization / Venue"
                className={field}
                value={entry.organization}
                onChange={(event) => updateAdditional(index, { organization: event.target.value })}
              />
              <input
                aria-label="Item date"
                placeholder="Year (e.g. 2024)"
                className={field}
                value={entry.period}
                onChange={(event) => updateAdditional(index, { period: event.target.value })}
              />
              <IconRemove
                label="Remove item"
                onClick={() => set({ extra: s.extra.filter((_, itemIndex) => itemIndex !== index) })}
              />
            </div>
            <textarea
              aria-label="Item details"
              rows={2}
              placeholder="Short result, recognition, description, or relevant link"
              className={`${field} leading-relaxed`}
              value={entry.details}
              onChange={(event) => updateAdditional(index, { details: event.target.value })}
            />
          </div>
        ))}
      </EditorSection>

      {/* REFERENCES SECTION (CV & optional for Resume) */}
      <EditorSection
        title="References (Professors, Advisors & Mentors)"
        addLabel="Add reference"
        onAdd={() =>
          set({
            references: [...(s.references || []), blankReference()],
          })
        }
      >
        {(!s.references || s.references.length === 0) ? (
          <p className="text-xs italic text-muted-foreground">
            No references added yet. Click &ldquo;Add reference&rdquo; to add professors, supervisors, or mentors who can refer you.
          </p>
        ) : null}
        {(s.references || []).map((entry, index) => (
          <div key={index} className="space-y-2 border-l-2 border-border pl-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                aria-label="Reference Name"
                placeholder="Full Name (e.g. Prof. Martin Rinard, Dr. Jane Smith)"
                className={field}
                value={entry.name}
                onChange={(e) => updateReference(index, { name: e.target.value })}
              />
              <input
                aria-label="Reference Title"
                placeholder="Title / Position (e.g. Professor of Computer Science, Director)"
                className={field}
                value={entry.title}
                onChange={(e) => updateReference(index, { title: e.target.value })}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                aria-label="Reference Organization"
                placeholder="Institution / Company (e.g. MIT, Stanford, Google)"
                className={field}
                value={entry.organization}
                onChange={(e) => updateReference(index, { organization: e.target.value })}
              />
              <input
                aria-label="Reference Relationship"
                placeholder="Relationship (e.g. Academic Advisor, Direct Supervisor)"
                className={field}
                value={entry.relationship ?? ""}
                onChange={(e) => updateReference(index, { relationship: e.target.value })}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="email"
                aria-label="Reference Email"
                placeholder="Email address (e.g. prof@university.edu)"
                className={field}
                value={entry.email}
                onChange={(e) => updateReference(index, { email: e.target.value })}
              />
              <input
                type="tel"
                aria-label="Reference Phone"
                placeholder="Phone (e.g. +1 617-555-0100)"
                className={field}
                value={entry.phone}
                onChange={(e) => updateReference(index, { phone: e.target.value })}
              />
              <IconRemove
                label="Remove reference"
                onClick={() =>
                  set({
                    references: (s.references || []).filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              />
            </div>
          </div>
        ))}
      </EditorSection>

      {/* ATTACHMENTS & ENCLOSURES SECTION */}
      <EditorSection
        title="Attachments & Enclosures"
        addLabel="Add attachment mention"
        onAdd={() =>
          set({
            attachments: [...(s.attachments || []), ""],
          })
        }
      >
        <p className="text-xs text-muted-foreground">
          Mention documents or portfolio items enclosed with your application (e.g., transcripts, letters of recommendation).
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-muted-foreground self-center mr-1">Quick add:</span>
          {COMMON_ATTACHMENTS.map((preset) => {
            const isAdded = (s.attachments || []).includes(preset);
            return (
              <button
                key={preset}
                type="button"
                className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                  isAdded
                    ? "border-accent/40 bg-accent/10 text-accent font-medium"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                onClick={() => {
                  if (isAdded) {
                    set({ attachments: (s.attachments || []).filter((item) => item !== preset) });
                  } else {
                    set({ attachments: [...(s.attachments || []), preset] });
                  }
                }}
              >
                {isAdded ? "✓ " : "+ "}{preset}
              </button>
            );
          })}
        </div>

        {(!s.attachments || s.attachments.length === 0) ? (
          <p className="text-xs italic text-muted-foreground mt-2">
            No attachments specified. Click a suggestion above or &ldquo;Add attachment mention&rdquo;.
          </p>
        ) : null}

        <div className="mt-2 space-y-2">
          {(s.attachments || []).map((attachment, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                aria-label={`Attachment ${index + 1}`}
                placeholder="Document name (e.g. Official Academic Transcripts, Writing Sample)"
                className={field}
                value={attachment}
                onChange={(e) =>
                  set({
                    attachments: (s.attachments || []).map((item, itemIndex) =>
                      itemIndex === index ? e.target.value : item
                    ),
                  })
                }
              />
              <IconRemove
                label={`Remove attachment ${index + 1}`}
                onClick={() =>
                  set({
                    attachments: (s.attachments || []).filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              />
            </div>
          ))}
        </div>
      </EditorSection>
    </div>
  );
}

function EditorSection({
  title,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className={label}>{title}</span>
        <Button type="button" variant="outline" size="sm" className="gap-1 rounded-sm" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" /> {addLabel}
        </Button>
      </div>
      <div className="mt-3 space-y-4">{children}</div>
    </div>
  );
}

function IconRemove({ label: ariaLabel, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="shrink-0 text-muted-foreground hover:text-destructive"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={onClick}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

function PersonalSection({
  personal,
  onChange,
}: {
  personal: PersonalInfo;
  onChange: (patch: Partial<PersonalInfo>) => void;
}) {
  return (
    <div className="space-y-4 rounded-sm border border-border/80 bg-card/40 p-4">
      <div className="flex items-center gap-2 border-b border-border pb-2.5">
        <User className="h-4 w-4 text-accent" />
        <span className={label}>Personal & Contact Information</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80" htmlFor="ed-full-name">
            Full name
          </label>
          <input
            id="ed-full-name"
            aria-label="Full name"
            placeholder="e.g. SK. YEASIN AHSANULLAH AL-GALIB"
            className={field}
            value={personal.fullName}
            onChange={(event) => onChange({ fullName: event.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80" htmlFor="ed-headline">
            Professional title / headline
          </label>
          <input
            id="ed-headline"
            aria-label="Professional title / headline"
            placeholder="e.g. Junior Software Engineer • Full-Stack & Applied AI"
            className={field}
            value={personal.headline}
            onChange={(event) => onChange({ headline: event.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80" htmlFor="ed-email">
            Email
          </label>
          <input
            id="ed-email"
            type="email"
            aria-label="Email address"
            placeholder="e.g. name@example.com"
            className={field}
            value={personal.email}
            onChange={(event) => onChange({ email: event.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80" htmlFor="ed-phone">
            Phone
          </label>
          <input
            id="ed-phone"
            type="tel"
            aria-label="Phone number"
            placeholder="e.g. +8801946303020"
            className={field}
            value={personal.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80" htmlFor="ed-location">
            Location
          </label>
          <input
            id="ed-location"
            aria-label="Location"
            placeholder="e.g. Khulna, Bangladesh"
            className={field}
            value={personal.location}
            onChange={(event) => onChange({ location: event.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80" htmlFor="ed-website">
            Portfolio / Website
          </label>
          <input
            id="ed-website"
            aria-label="Portfolio or website"
            placeholder="e.g. portfolio.dev"
            className={field}
            value={personal.website}
            onChange={(event) => onChange({ website: event.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80" htmlFor="ed-github">
            GitHub
          </label>
          <input
            id="ed-github"
            aria-label="GitHub profile or handle"
            placeholder="e.g. @SYAAGalib or github.com/SYAAGalib"
            className={field}
            value={personal.github}
            onChange={(event) => onChange({ github: event.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80" htmlFor="ed-linkedin">
            LinkedIn
          </label>
          <input
            id="ed-linkedin"
            aria-label="LinkedIn profile or handle"
            placeholder="e.g. @syaagalib or linkedin.com/in/syaagalib"
            className={field}
            value={personal.linkedin}
            onChange={(event) => onChange({ linkedin: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function SkillsInput({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [text, setText] = useState(() => skills.join(", "));
  const prevSkillsRef = useRef(skills);

  useEffect(() => {
    const prevJoined = prevSkillsRef.current.join(", ");
    const nextJoined = skills.join(", ");
    if (prevJoined !== nextJoined) {
      prevSkillsRef.current = skills;
      setText(nextJoined);
    }
  }, [skills]);

  return (
    <div>
      <label className={label} htmlFor="ed-skills">
        Skills (comma separated)
      </label>
      <textarea
        id="ed-skills"
        rows={2}
        className={`${field} mt-1`}
        placeholder="e.g. TypeScript, React, PostgreSQL, Docker, AWS, GraphQL"
        value={text}
        onChange={(event) => {
          const val = event.target.value;
          setText(val);
          const parsed = val
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);
          prevSkillsRef.current = parsed;
          onChange(parsed);
        }}
        onBlur={() => {
          setText(skills.join(", "));
        }}
      />
    </div>
  );
}