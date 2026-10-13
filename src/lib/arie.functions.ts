import { createServerFn } from "@tanstack/react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import { generateJson, GatewayError } from "./ai-gateway.server";
import {
  AnalyzerInput,
  BuilderInput,
  DeleteUserDocumentInput,
  GetAnalysesInput,
  GetDocumentInput,
  GetUserDocumentInput,
  ListUserDocumentsInput,
  SaveDocumentInput,
  SaveUserDocumentInput,
  SummaryRewriteInput,
  analyzerJsonSchema,
  builderJsonSchema,
  summaryJsonSchema,
  type AnalyzerResult,
  type BuilderResult,
  type UserDocumentItem,
  type UserStats,
} from "./schemas";
import {
  getDocumentFromDb,
  saveDocumentToDb,
  saveAnalysisToDb,
  getRecentAnalysesFromDb,
  listUserDocuments,
  getUserDocument,
  getLatestUserDocument,
  saveUserDocument,
  deleteUserDocument,
  listUserAnalyses,
  saveUserAnalysis,
  getUserStats,
  type DbDocument,
  type DbAnalysis,
} from "./db.server";

const BASE_RULES = `You are an ATS document engine for job seekers.
Rules:
- Extract candidate contact details into "personal" (fullName, headline/target title, email, phone, location, website, github, linkedin) if present in candidate details. Leave any unmentioned field as an empty string "". Never invent contact details.
- For experience and education: provide "startDate" and "endDate" (e.g. "2022" or "Jan 2022"). Leave "endDate" as an empty string "" if the candidate is currently working or studying there (Present). If dates are not mentioned at all, use empty strings "".
- Extract candidate spoken and written languages into "languages" with "language" and "proficiency" (e.g. "Native / Bilingual", "Fluent", "Professional Working", "Intermediate / Conversational", "Elementary / Basic"). Leave array empty if no languages are mentioned.
- Use only facts present in the user's input. Never invent employers, dates, degrees, or metrics.
- Plain text only: no tables, icons, emojis, markdown, or HTML.
- Bullets start with a strong action verb, one line each, max 2 lines.
- Keep language concrete and human; avoid buzzword filler and robotic phrasing.
- Leave an array empty if the input has nothing for it.`;

const DOC_RULES: Record<string, string> = {
  resume: `Build an ATS resume: extract contact info into "personal", 2-4 sentence professional summary, flat skills list (hard skills first), reverse-chronological experience with 3-5 bullets each, education, structured certifications, and languages with proficiency. Put projects and awards in "extra" as structured entries. If references are provided, put them in "references".`,
  cv: `Build an academic/professional CV:
- The CV MUST include a tailored Cover Letter in "cover_letter" following this exact pattern:
"[Your Full Name]

[City, State ZIP] | [Phone] | [Email] | [LinkedIn URL]

[Month Day, Year]

Dear [Hiring Manager's name, or \\"Hiring Team\\" if the posting does not name one],

I am applying for the [exact job title as written in the posting] role at [Company]. I am a [your current title] with [X] years in [field], and [one sentence naming the posting's single hardest requirement and the evidence you have for it].

In my current role at [Current Company], I [specific accomplishment that uses two or three terms from the posting, with a number attached]. Before that, I [second accomplishment covering a different requirement from the posting, also with a number]. Both map directly to [requirement quoted from the posting].

[Optional, one sentence: something specific about this employer - a product, a market, a recent change - that explains why this job rather than any job. Delete this line rather than filling it with a compliment.]

I would welcome the chance to talk about [team, product or goal named in the posting]. Thank you for your time.

Sincerely,

[Your Full Name]"
(Fill in the candidate's actual facts into this pattern; do not leave literal brackets when details exist in input).
- Extract any professors, advisors, managers, or colleagues who can refer the candidate into "references" with name, title, organization, email, phone, and relationship.
- Extract any attachments, enclosures, or supplementary documents mentioned (transcripts, letters of recommendation, portfolio, degree certificates) into "attachments".
- Extract contact info into "personal", summary, skills, research and professional experience with detailed bullets, education, structured certifications, and languages with proficiency. Put publications, conferences, grants, teaching, projects, and awards in "extra" as structured entries.`,
  cover_letter: `Build an ATS cover letter:
- In "cover_letter", write the full cover letter following this exact pattern:
"[Your Full Name]

[City, State ZIP] | [Phone] | [Email] | [LinkedIn URL]

[Month Day, Year]

Dear [Hiring Manager's name, or \\"Hiring Team\\" if the posting does not name one],

I am applying for the [exact job title as written in the posting] role at [Company]. I am a [your current title] with [X] years in [field], and [one sentence naming the posting's single hardest requirement and the evidence you have for it].

In my current role at [Current Company], I [specific accomplishment that uses two or three terms from the posting, with a number attached]. Before that, I [second accomplishment covering a different requirement from the posting, also with a number]. Both map directly to [requirement quoted from the posting].

[Optional, one sentence: something specific about this employer - a product, a market, a recent change - that explains why this job rather than any job. Delete this line rather than filling it with a compliment.]

I would welcome the chance to talk about [team, product or goal named in the posting]. Thank you for your time.

Sincerely,

[Your Full Name]"
- Extract contact info into "personal".
- Put each paragraph in "extra" as an entry with type "Paragraph" and the paragraph text in "details".
- If any attachments or enclosures are mentioned, put them in "attachments".`,
};

function toMessage(error: unknown) {
  if (error instanceof GatewayError) return error.message;
  return error instanceof Error ? error.message : "Something went wrong.";
}

export const listMyDocuments = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ListUserDocumentsInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; data: UserDocumentItem[] } | { ok: false; error: string }> => {
    try {
      const { userId } = await auth();
      if (!userId) return { ok: true, data: [] };
      const docs = listUserDocuments(userId, data.documentType);
      return { ok: true, data: docs };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const getMyDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => GetUserDocumentInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; data: UserDocumentItem | null } | { ok: false; error: string }> => {
    try {
      const { userId } = await auth();
      if (!userId) return { ok: false, error: "Please sign in to view this document." };
      const doc = getUserDocument(userId, data.id);
      return { ok: true, data: doc };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const saveMyDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SaveUserDocumentInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; data: UserDocumentItem } | { ok: false; error: string }> => {
    try {
      const { userId } = await auth();
      if (!userId) return { ok: false, error: "Please sign in to save your documents." };
      const doc = saveUserDocument({
        id: data.id,
        userId,
        documentType: data.documentType,
        title: data.title,
        profile: data.profile,
        targetRole: data.targetRole,
        jobDescription: data.jobDescription,
        doc: data.doc,
      });
      return { ok: true, data: doc };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const deleteMyDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DeleteUserDocumentInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const { userId } = await auth();
      if (!userId) return { ok: false, error: "Please sign in to delete documents." };
      deleteUserDocument(userId, data.id);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const getMyStats = createServerFn({ method: "POST" })
  .handler(async (): Promise<{ ok: true; data: UserStats | null } | { ok: false; error: string }> => {
    try {
      const { userId } = await auth();
      if (!userId) return { ok: true, data: null };
      const stats = getUserStats(userId);
      return { ok: true, data: stats };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const getSavedDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => GetDocumentInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; data: DbDocument | null } | { ok: false; error: string }> => {
    try {
      const { userId } = await auth();
      if (userId) {
        const latest = getLatestUserDocument(userId, data.slug);
        if (latest) {
          return {
            ok: true,
            data: {
              slug: latest.id,
              document_type: latest.documentType,
              profile: latest.profile,
              target_role: latest.targetRole,
              job_description: latest.jobDescription,
              doc: latest.doc,
              created_at: latest.createdAt,
              updated_at: latest.updatedAt,
            },
          };
        }
      }
      const doc = getDocumentFromDb(data.slug);
      return { ok: true, data: doc };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const saveDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SaveDocumentInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; data: DbDocument } | { ok: false; error: string }> => {
    try {
      const { userId } = await auth();
      if (userId) {
        const doc = saveUserDocument({
          userId,
          documentType: data.documentType as any,
          title: data.targetRole ? `${data.targetRole}` : `My ${data.documentType}`,
          profile: data.profile,
          targetRole: data.targetRole,
          jobDescription: data.jobDescription,
          doc: data.doc,
        });
        return {
          ok: true,
          data: {
            slug: doc.id,
            document_type: doc.documentType,
            profile: doc.profile,
            target_role: doc.targetRole,
            job_description: doc.jobDescription,
            doc: doc.doc,
            created_at: doc.createdAt,
            updated_at: doc.updatedAt,
          },
        };
      }
      const doc = saveDocumentToDb(data);
      return { ok: true, data: doc };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const getRecentAnalyses = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => GetAnalysesInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; data: DbAnalysis[] } | { ok: false; error: string }> => {
    try {
      const { userId } = await auth();
      const rows = userId
        ? listUserAnalyses(userId, data.target, data.limit)
        : getRecentAnalysesFromDb(data.target, data.limit);
      return { ok: true, data: rows };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const buildDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => BuilderInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; result: BuilderResult } | { ok: false; error: string }> => {
    try {
      const result = await generateJson<BuilderResult>({
        schemaName: "document_builder_output",
        schema: builderJsonSchema,
        instructions: `${BASE_RULES}\n${DOC_RULES[data.documentType]}\nSet document_type to "${data.documentType}".`,
        input: [
          data.targetRole ? `TARGET ROLE:\n${data.targetRole}` : "",
          `CANDIDATE DETAILS:\n${data.profile}`,
          data.jobDescription ? `JOB DESCRIPTION:\n${data.jobDescription}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      });
      const docResult = { ...result, document_type: data.documentType };
      try {
        const { userId } = await auth();
        if (userId) {
          saveUserDocument({
            userId,
            documentType: data.documentType,
            title: data.targetRole ? `${data.targetRole}` : `My ${data.documentType}`,
            profile: data.profile,
            targetRole: data.targetRole,
            jobDescription: data.jobDescription,
            doc: docResult,
          });
        } else {
          saveDocumentToDb({
            slug: data.documentType,
            documentType: data.documentType,
            profile: data.profile,
            targetRole: data.targetRole,
            jobDescription: data.jobDescription,
            doc: docResult,
          });
        }
      } catch {
        /* don't fail generation if db write fails */
      }
      return { ok: true, result: docResult };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const analyzeDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => AnalyzerInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; result: AnalyzerResult } | { ok: false; error: string }> => {
    try {
      const result = await generateJson<AnalyzerResult>({
        schemaName: "analyzer_output",
        schema: analyzerJsonSchema,
        instructions: `${BASE_RULES}
Analyze the ${data.target.replace("_", " ")} against the job description.
Score 0-100 on structure, required sections, keyword coverage, action verbs, and readability.
Match keywords both exactly and semantically. Report only keywords and skills that actually appear in the job description.
Keep every list to at most 8 short items. Suggestions are single actionable sentences.`,
        input: data.pdf
          ? [
              {
                role: "user",
                content: [
                  { type: "input_text", text: `Analyze the attached ${data.target.replace("_", " ")} PDF against this job description:\n${data.jobDescription}` },
                  { type: "input_file", filename: data.pdf.filename, file_data: `data:application/pdf;base64,${data.pdf.base64}` },
                ],
              },
            ]
          : `DOCUMENT (${data.target}):\n${data.document}\n\nJOB DESCRIPTION:\n${data.jobDescription}`,
      });
      try {
        const { userId } = await auth();
        if (userId) {
          saveUserAnalysis({
            userId,
            documentId: data.documentId,
            target: data.target,
            title: `Analysis for ${data.target}`,
            jobDescription: data.jobDescription,
            documentText: data.pdf ? `[PDF File: ${data.pdf.filename}]` : data.document,
            result,
          });
        } else {
          saveAnalysisToDb({
            target: data.target,
            jobDescription: data.jobDescription,
            documentText: data.pdf ? `[PDF File: ${data.pdf.filename}]` : data.document,
            result,
          });
        }
      } catch {
        /* don't fail analysis if db write fails */
      }
      return { ok: true, result };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const rewriteSummary = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SummaryRewriteInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; summary: string } | { ok: false; error: string }> => {
    try {
      const result = await generateJson<{ summary: string }>({
        schemaName: "summary_rewrite_output",
        schema: summaryJsonSchema,
        instructions: `${BASE_RULES}\nRewrite only the professional summary. Keep it to 2-4 concise sentences, preserve every factual claim, strengthen clarity and relevance, and return strict JSON.`,
        input: [
          data.targetRole ? `TARGET ROLE:\n${data.targetRole}` : "",
          data.jobDescription ? `JOB DESCRIPTION:\n${data.jobDescription}` : "",
          `CURRENT SUMMARY:\n${data.currentSummary}`,
          `FULL DOCUMENT FACTS:\n${data.documentText}`,
        ].filter(Boolean).join("\n\n"),
      });
      return { ok: true, summary: result.summary.trim() };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });
