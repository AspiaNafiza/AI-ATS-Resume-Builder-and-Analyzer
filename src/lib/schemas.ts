import { z } from "zod";

export const documentTypes = ["resume", "cv", "cover_letter"] as const;
export type DocumentType = (typeof documentTypes)[number];

export const analyzerTargets = ["resume", "cv", "cover_letter"] as const;
export type AnalyzerTarget = (typeof analyzerTargets)[number];

export const BuilderInput = z.object({
  documentType: z.enum(documentTypes),
  profile: z.string().min(30, "Add more detail about your background."),
  jobDescription: z.string().default(""),
  targetRole: z.string().default(""),
});
export type BuilderInput = z.infer<typeof BuilderInput>;

export const AnalyzerInput = z.object({
  target: z.enum(analyzerTargets),
  document: z.string().default(""),
  pdf: z
    .object({
      filename: z.string().min(1).max(180),
      base64: z.string().min(1).max(14_000_000),
    })
    .nullable()
    .default(null),
  jobDescription: z.string().min(20, "Paste the job description."),
  documentId: z.string().optional(),
}).superRefine((value, ctx) => {
  if (value.document.trim().length < 30 && !value.pdf) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["document"], message: "Paste the full document text or upload a PDF." });
  }
});
export type AnalyzerInput = z.infer<typeof AnalyzerInput>;

export const SummaryRewriteInput = z.object({
  documentType: z.enum(documentTypes),
  currentSummary: z.string().min(1, "Write a summary before improving it."),
  documentText: z.string().min(30, "Add more document detail before improving the summary."),
  profile: z.string().default(""),
  jobDescription: z.string().default(""),
  targetRole: z.string().default(""),
});

export type PersonalInfo = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
};

export type ExperienceEntry = {
  title: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  period?: string;
  bullets: string[];
};

export type EducationEntry = {
  credential: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  period?: string;
};

export type CertificationEntry = {
  name: string;
  issuer: string;
  period: string;
};

export type AdditionalEntry = {
  type: string;
  title: string;
  organization: string;
  period: string;
  details: string;
};

export type LanguageEntry = {
  language: string;
  proficiency: string;
};

export type ReferenceEntry = {
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  relationship?: string;
};

export type BuilderResult = {
  document_type: DocumentType;
  personal?: PersonalInfo;
  sections: {
    summary: string;
    skills: string[];
    experience: ExperienceEntry[];
    education: EducationEntry[];
    certifications: CertificationEntry[];
    extra: AdditionalEntry[];
    languages: LanguageEntry[];
    references?: ReferenceEntry[];
    attachments?: string[];
    cover_letter?: string;
  };
};

export type AnalyzerResult = {
  ats_score: number;
  keyword_match: { found: string[]; missing: string[] };
  skill_match: { matched: string[]; missing: string[] };
  experience_relevance: { strong_points: string[]; weak_points: string[] };
  suggestions: string[];
};

const strArray = { type: "array", items: { type: "string" } };

const personalJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["fullName", "headline", "email", "phone", "location", "website", "github", "linkedin"],
  properties: {
    fullName: { type: "string" },
    headline: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    location: { type: "string" },
    website: { type: "string" },
    github: { type: "string" },
    linkedin: { type: "string" },
  },
};

const certificationArray = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["name", "issuer", "period"],
    properties: {
      name: { type: "string" },
      issuer: { type: "string" },
      period: { type: "string" },
    },
  },
};

const additionalArray = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["type", "title", "organization", "period", "details"],
    properties: {
      type: { type: "string" },
      title: { type: "string" },
      organization: { type: "string" },
      period: { type: "string" },
      details: { type: "string" },
    },
  },
};

const languageArray = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["language", "proficiency"],
    properties: {
      language: { type: "string" },
      proficiency: { type: "string" },
    },
  },
};

const referenceArray = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["name", "title", "organization", "email", "phone"],
    properties: {
      name: { type: "string" },
      title: { type: "string" },
      organization: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      relationship: { type: "string" },
    },
  },
};

export const builderJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["document_type", "personal", "sections"],
  properties: {
    document_type: { type: "string", enum: [...documentTypes] },
    personal: personalJsonSchema,
    sections: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "skills", "experience", "education", "certifications", "extra", "languages"],
      properties: {
        summary: { type: "string" },
        skills: strArray,
        experience: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "organization", "bullets"],
            properties: {
              title: { type: "string" },
              organization: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              period: { type: "string" },
              bullets: strArray,
            },
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["credential", "institution"],
            properties: {
              credential: { type: "string" },
              institution: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              period: { type: "string" },
            },
          },
        },
        certifications: certificationArray,
        extra: additionalArray,
        languages: languageArray,
        references: referenceArray,
        attachments: strArray,
        cover_letter: { type: "string" },
      },
    },
  },
};

export const summaryJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary"],
  properties: { summary: { type: "string" } },
};

export const analyzerJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "ats_score",
    "keyword_match",
    "skill_match",
    "experience_relevance",
    "suggestions",
  ],
  properties: {
    ats_score: { type: "integer", minimum: 0, maximum: 100 },
    keyword_match: {
      type: "object",
      additionalProperties: false,
      required: ["found", "missing"],
      properties: { found: strArray, missing: strArray },
    },
    skill_match: {
      type: "object",
      additionalProperties: false,
      required: ["matched", "missing"],
      properties: { matched: strArray, missing: strArray },
    },
    experience_relevance: {
      type: "object",
      additionalProperties: false,
      required: ["strong_points", "weak_points"],
      properties: { strong_points: strArray, weak_points: strArray },
    },
    suggestions: strArray,
  },
};

export const GetDocumentInput = z.object({
  slug: z.string().min(1),
});
export type GetDocumentInput = z.infer<typeof GetDocumentInput>;

export const SaveDocumentInput = z.object({
  slug: z.string().min(1),
  documentType: z.string().default("resume"),
  profile: z.string().default(""),
  targetRole: z.string().default(""),
  jobDescription: z.string().default(""),
  doc: z.any().nullable().default(null),
});
export type SaveDocumentInput = z.infer<typeof SaveDocumentInput>;

export const GetAnalysesInput = z.object({
  target: z.string().optional(),
  limit: z.number().int().positive().max(100).default(10),
});
export type GetAnalysesInput = z.infer<typeof GetAnalysesInput>;

export type DbDocument = {
  slug: string;
  document_type: string;
  profile: string;
  target_role: string;
  job_description: string;
  doc: BuilderResult | null;
  created_at: string;
  updated_at: string;
};

export type DbAnalysis = {
  id: string;
  target: string;
  job_description: string;
  document_text: string;
  ats_score: number;
  result: AnalyzerResult;
  created_at: string;
};

export const SaveUserDocumentInput = z.object({
  id: z.string().optional(),
  documentType: z.enum(documentTypes),
  title: z.string().min(1).default("Untitled Document"),
  profile: z.string().default(""),
  targetRole: z.string().default(""),
  jobDescription: z.string().default(""),
  doc: z.any().nullable().default(null),
});
export type SaveUserDocumentInput = z.infer<typeof SaveUserDocumentInput>;

export const GetUserDocumentInput = z.object({
  id: z.string().min(1),
});
export type GetUserDocumentInput = z.infer<typeof GetUserDocumentInput>;

export const ListUserDocumentsInput = z.object({
  documentType: z.string().optional(),
});
export type ListUserDocumentsInput = z.infer<typeof ListUserDocumentsInput>;

export const DeleteUserDocumentInput = z.object({
  id: z.string().min(1),
});
export type DeleteUserDocumentInput = z.infer<typeof DeleteUserDocumentInput>;

export type UserDocumentItem = {
  id: string;
  userId: string;
  documentType: DocumentType;
  title: string;
  profile: string;
  targetRole: string;
  jobDescription: string;
  doc: BuilderResult | null;
  createdAt: string;
  updatedAt: string;
};

export type UserStats = {
  resumesCount: number;
  cvsCount: number;
  coverLettersCount: number;
  analysesCount: number;
  recentAnalyses: { id: string; target: string; atsScore: number; createdAt: string }[];
  documents: { id: string; title: string; documentType: DocumentType; updatedAt: string }[];
};


