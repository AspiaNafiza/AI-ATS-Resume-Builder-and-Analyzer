import type { DocumentType } from "./schemas";

export const slugs = ["resume", "cv", "cover-letter"] as const;
export type DocSlug = (typeof slugs)[number];

export function isSlug(value: string): value is DocSlug {
  return (slugs as readonly string[]).includes(value);
}

export function slugToType(slug: DocSlug): DocumentType {
  return slug === "cover-letter" ? "cover_letter" : slug;
}

export const docLabel: Record<DocSlug, string> = {
  resume: "Resume",
  cv: "CV",
  "cover-letter": "Cover letter",
};

export const builderCopy: Record<
  DocSlug,
  { title: string; description: string; placeholder: string }
> = {
  resume: {
    title: "Resume builder",
    description:
      "Paste your work history, skills and education. You get a parser-safe resume with action-verb bullets.",
    placeholder:
      "Name, contact line, roles with employer and dates, what you did and any numbers, skills, education, certifications…",
  },
  cv: {
    title: "CV builder",
    description:
      "For academic and research roles: publications, teaching, grants and conferences stay listed as plain lines.",
    placeholder:
      "Positions and institutions with dates, research focus, publications, conferences, grants, teaching, degrees…",
  },
  "cover-letter": {
    title: "Cover letter builder",
    description:
      "Three to four short paragraphs tailored to the posting. No filler and no robotic phrasing.",
    placeholder:
      "Who you are, relevant experience and results, why this employer, availability or notice period…",
  },
};

export const analyzerCopy: Record<DocSlug, { title: string; description: string }> = {
  resume: {
    title: "Resume analyzer",
    description: "Score your resume against a posting and see which terms are missing.",
  },
  cv: {
    title: "CV analyzer",
    description: "Check a CV against a posting for keyword, skill and experience coverage.",
  },
  "cover-letter": {
    title: "Cover letter analyzer",
    description: "See whether your letter reflects what the posting actually asks for.",
  },
};
