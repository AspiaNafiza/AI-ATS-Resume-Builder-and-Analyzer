import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BookmarkCheck, Download, ExternalLink, FileText, FolderOpen, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useClerk } from "@clerk/tanstack-react-start";
import { analyzeDocument, getRecentAnalyses, listMyDocuments } from "@/lib/arie.functions";
import { analyzerCopy, docLabel, isSlug, slugToType, type DocSlug } from "@/lib/doc-meta";
import { DEMO_DOCS } from "@/lib/demo-docs";
import { exportDocumentToPdf } from "@/lib/pdf-export";
import { toPlainText } from "@/components/app/DocumentPreview";
import { normalizeLegacyDoc } from "@/components/app/DocumentEditor";
import {
  ErrorNotice,
  Loader,
  Panel,
  ScoreCircle,
  SectionHeader,
  TagList,
} from "@/components/app/primitives";
import type { AnalyzerResult, AnalyzerTarget, DbAnalysis, UserDocumentItem } from "@/lib/schemas";

export const Route = createFileRoute("/analyzer/$type")({
  beforeLoad: ({ params }) => {
    if (!isSlug(params.type)) {
      throw redirect({
        to: "/analyzer/$type",
        params: { type: "resume" },
      });
    }
  },
  head: ({ params }) => {
    const slug = isSlug(params.type) ? params.type : "resume";
    const copy = analyzerCopy[slug];
    return {
      meta: [
        { title: `${copy.title} — ATS Resume Suite` },
        { name: "description", content: copy.description },
        { property: "og:title", content: `${copy.title} — ATS Resume Suite` },
        { property: "og:description", content: copy.description },
      ],
    };
  },
  component: AnalyzerScreen,
});

function AnalyzerScreen() {
  const { type } = Route.useParams();
  const slug = type as DocSlug;
  const copy = analyzerCopy[slug];
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { openSignIn } = useClerk();

  const [inputMode, setInputMode] = useState<"saved" | "pdf" | "text">("saved");
  const [savedDocs, setSavedDocs] = useState<UserDocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const [document, setDocument] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<{
    name: string;
    size: number;
    base64: string;
  } | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const listDocs = useServerFn(listMyDocuments);
  const analyze = useServerFn(analyzeDocument);
  const getAnalyses = useServerFn(getRecentAnalyses);
  const [history, setHistory] = useState<DbAnalysis[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Fetch saved documents for signed-in users
  useEffect(() => {
    if (!isAuthLoaded) return;
    let cancelled = false;

    if (!isSignedIn) {
      setSavedDocs([]);
      setSelectedDocId(null);
      setInputMode("pdf");
      return;
    }

    async function fetchUserDocs() {
      setLoadingSaved(true);
      try {
        const res = await listDocs({ data: { documentType: slugToType(slug) } });
        if (cancelled) return;
        if (res.ok && res.data && res.data.length > 0) {
          setSavedDocs(res.data);
          const first = res.data[0];
          if (first) {
            setSelectedDocId(first.id);
            if (!jobDescription.trim() && first.jobDescription) {
              setJobDescription(first.jobDescription);
            }
          }
          setInputMode("saved");
        } else {
          setSavedDocs([]);
          setSelectedDocId(null);
          setInputMode("pdf");
        }
      } catch {
        if (!cancelled) {
          setSavedDocs([]);
          setSelectedDocId(null);
        }
      } finally {
        if (!cancelled) setLoadingSaved(false);
      }
    }

    fetchUserDocs();

    return () => {
      cancelled = true;
    };
  }, [slug, isSignedIn, isAuthLoaded]);

  const handleFile = (file: File | null) => {
    if (!file) return;
    setPdfError(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Please upload a PDF document.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPdfError("PDF file size must be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? (result.split(",")[1] ?? "") : result;
      setPdfFile({
        name: file.name,
        size: file.size,
        base64,
      });
    };
    reader.onerror = () => {
      setPdfError("Failed to read the selected PDF file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const loadHistory = async () => {
    try {
      const res = await getAnalyses({
        data: {
          target: slugToType(slug) as AnalyzerTarget,
          limit: 5,
        },
      });
      if (res.ok) {
        setHistory(res.data);
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    setSelectedHistoryId(null);
    loadHistory();
  }, [slug]);

  const selectedDoc = savedDocs.find((d) => d.id === selectedDocId) ?? null;
  const getSavedDocText = (item: UserDocumentItem | null): string => {
    if (!item) return "";
    if (item.doc) {
      return toPlainText(normalizeLegacyDoc(item.doc, item.documentType));
    }
    return item.profile || "";
  };
  const selectedDocText = getSavedDocText(selectedDoc);

  const mutation = useMutation({
    mutationFn: () => {
      let docText = "";
      let activeDocId: string | undefined = undefined;

      if (inputMode === "saved") {
        docText = selectedDocText;
        activeDocId = selectedDoc?.id || undefined;
      } else if (inputMode === "text") {
        docText = document.trim();
      }

      return analyze({
        data: {
          target: slugToType(slug) as AnalyzerTarget,
          document: docText,
          pdf: inputMode === "pdf" && pdfFile ? { filename: pdfFile.name, base64: pdfFile.base64 } : null,
          jobDescription: jobDescription.trim(),
          documentId: activeDocId,
        },
      });
    },
    onSuccess: (res) => {
      if (res.ok) {
        setSelectedHistoryId(null);
        loadHistory();
      }
    },
  });

  const hasDocument =
    inputMode === "saved"
      ? selectedDoc !== null && selectedDocText.length >= 30
      : inputMode === "pdf"
        ? pdfFile !== null
        : document.trim().length >= 30;
  const ready = hasDocument && jobDescription.trim().length >= 20;
  const response = mutation.data;
  const selectedHistory = history.find((h) => h.id === selectedHistoryId);
  const result: AnalyzerResult | null = selectedHistory
    ? selectedHistory.result
    : response && response.ok
      ? response.result
      : null;
  const error = mutation.isError
    ? "We couldn't reach the analysis service. Please try again."
    : response && !response.ok
      ? response.error
      : null;

  return (
    <div className="container-page py-10 md:py-14">
      <SectionHeader eyebrow={docLabel[slug]} title={copy.title} description={copy.description} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) mutation.mutate();
          }}
        >
          <Panel
            title={`Your ${docLabel[slug].toLowerCase()}`}
            aside={
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
                    inputMode === "saved"
                      ? "bg-primary text-primary-foreground"
                      : "border border-input text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setInputMode("saved")}
                >
                  From your documents
                </button>
                <button
                  type="button"
                  className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
                    inputMode === "pdf"
                      ? "bg-primary text-primary-foreground"
                      : "border border-input text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setInputMode("pdf")}
                >
                  Upload PDF
                </button>
                <button
                  type="button"
                  className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
                    inputMode === "text"
                      ? "bg-primary text-primary-foreground"
                      : "border border-input text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setInputMode("text")}
                >
                  Paste text
                </button>
              </div>
            }
          >
            {inputMode === "saved" ? (
              <div>
                {!isSignedIn ? (
                  <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-5 text-center">
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <BookmarkCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground">Analyze from your saved database</h4>
                      <p className="mx-auto max-w-sm text-xs text-muted-foreground">
                        Sign in to select any resume, CV, or cover letter you have built or saved, without having to upload PDFs or re-paste text.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openSignIn()}
                        className="rounded-sm bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Sign in to access library
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const demo = DEMO_DOCS[slug];
                          const demoText = toPlainText(demo);
                          setDocument(demoText);
                          setInputMode("text");
                          if (!jobDescription.trim()) {
                            setJobDescription(
                              slug === "cover-letter"
                                ? "Seeking a Lead Technical Program Manager with experience in AI systems, cross-functional delivery, distributed infrastructure, and stakeholder communication."
                                : "Seeking a Senior Engineer with deep expertise in TypeScript, distributed systems, clean architecture, automated testing, and cloud environments."
                            );
                          }
                          toast.success(`Loaded sample ${docLabel[slug]} into text analyzer.`);
                        }}
                        className="rounded-sm border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
                      >
                        Try sample {docLabel[slug]}
                      </button>
                    </div>
                  </div>
                ) : loadingSaved ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Loading your saved documents…</div>
                ) : savedDocs.length === 0 ? (
                  <div className="space-y-3 rounded-lg border border-border bg-surface p-6 text-center">
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground">No saved {docLabel[slug].toLowerCase()}s found</h4>
                      <p className="mx-auto max-w-sm text-xs text-muted-foreground">
                        Build your first {docLabel[slug].toLowerCase()} in the builder and it will automatically appear here for instant ATS analysis.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <Link
                        to="/builder/$type"
                        params={{ type: slug }}
                        className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <span>Build a {docLabel[slug]} now</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setInputMode("pdf")}
                        className="rounded-sm border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
                      >
                        Upload PDF instead
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="savedDocSelect">
                        Select from your saved {docLabel[slug].toLowerCase()}s
                      </label>
                      <select
                        id="savedDocSelect"
                        value={selectedDocId || ""}
                        onChange={(e) => {
                          const newId = e.target.value;
                          setSelectedDocId(newId);
                          const found = savedDocs.find((d) => d.id === newId);
                          if (found?.jobDescription && !jobDescription.trim()) {
                            setJobDescription(found.jobDescription);
                          }
                        }}
                        className="mt-1.5 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                      >
                        {savedDocs.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title} (Saved {new Date(d.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedDoc ? (
                      <div className="space-y-3 rounded-sm border border-border bg-surface p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <BookmarkCheck className="h-4 w-4 shrink-0 text-primary" />
                              <h4 className="text-sm font-semibold text-foreground">{selectedDoc.title}</h4>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {selectedDoc.targetRole ? `Target: ${selectedDoc.targetRole}` : "General profile"} · Last saved {new Date(selectedDoc.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            {selectedDoc.doc ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedDoc.doc) {
                                    exportDocumentToPdf(
                                      selectedDoc.doc,
                                      `${selectedDoc.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`
                                    );
                                    toast.success("PDF downloaded successfully!");
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                title="Download as ATS-friendly PDF"
                              >
                                <Download className="h-3 w-3" />
                                <span>Download PDF</span>
                              </button>
                            ) : null}
                            <Link
                              to="/builder/$type"
                              params={{ type: slug }}
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline"
                            >
                              <span>Open in Builder</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>

                        <div className="max-h-36 overflow-y-auto rounded-sm border border-border/70 bg-background/60 p-2.5 font-mono text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                          {selectedDocText || "No text content found in document."}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>✓ Ready to analyze directly from your saved SQLite database</span>
                          <span>{selectedDocText.split(/\s+/).filter(Boolean).length} words</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : inputMode === "pdf" ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    handleFile(file);
                  }}
                />

                {pdfFile ? (
                  <div className="flex items-center justify-between border border-border bg-surface p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{pdfFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(pdfFile.size)} · Ready to analyze
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-sm border border-input px-2.5 py-1 text-xs hover:bg-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        aria-label="Remove uploaded PDF"
                        className="grid h-7 w-7 place-items-center rounded-sm text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setPdfFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0] ?? null;
                      handleFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-8 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-surface"
                    }`}
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-foreground">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium">Click or drag a PDF here to upload</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Supports PDF up to 10MB. Document content stays secure and private.
                    </p>
                  </div>
                )}

                {pdfError ? <p className="text-xs text-destructive">{pdfError}</p> : null}

                <p className="text-xs text-muted-foreground">
                  The document PDF is analyzed inline server-side against the posting without parsing in the browser.
                </p>
              </div>
            ) : (
              <div>
                <textarea
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  rows={14}
                  placeholder={`Paste the full text of your ${docLabel[slug].toLowerCase()}.`}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimum 30 characters required for text-based analysis.
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Job description">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="Paste the posting you are applying to."
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-ring"
            />
          </Panel>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={!ready || mutation.isPending}
              className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? "Analyzing…" : "Run analysis"}
            </button>
            {!ready ? (
              <span className="text-xs text-muted-foreground">
                {inputMode === "saved"
                  ? "Select a document from your library and paste the job description (at least 20 characters)."
                  : inputMode === "pdf"
                    ? "Upload a PDF and paste the job description (at least 20 characters)."
                    : "Both document text and job description are needed for a reliable score."}
              </span>
            ) : null}
            {mutation.isPending ? (
              <Loader
                label={
                  inputMode === "pdf"
                    ? "Analyzing PDF against the posting…"
                    : inputMode === "saved"
                      ? "Analyzing saved document against the posting…"
                      : "Comparing against the posting…"
                }
              />
            ) : null}
          </div>
        </form>

        <div className="space-y-4">
          {error ? <ErrorNotice message={error} /> : null}

          {result ? (
            <>
              <Panel
                title="Result"
                aside={
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Saved to SQLite</span>
                    {selectedHistory ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => setSelectedHistoryId(null)}
                      >
                        Back to current
                      </button>
                    ) : null}
                  </div>
                }
              >
                {selectedHistory ? (
                  <div className="mb-4 flex items-center justify-between rounded-sm border border-border bg-surface p-2.5 text-xs text-muted-foreground">
                    <span>
                      Viewing saved run from{" "}
                      <strong className="text-foreground">
                        {new Date(selectedHistory.created_at).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </strong>
                    </span>
                    <button
                      type="button"
                      className="font-medium text-accent hover:underline"
                      onClick={() => setSelectedHistoryId(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                ) : null}
                <ScoreCircle score={result.ats_score} />
              </Panel>

              <Panel title="Keywords">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Found
                </p>
                <TagList items={result.keyword_match.found} tone="good" empty="No posting keywords detected." />
                <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Missing
                </p>
                <TagList items={result.keyword_match.missing} tone="gap" empty="Nothing important missing." />
              </Panel>

              <Panel title="Skills">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Matched
                </p>
                <TagList items={result.skill_match.matched} tone="good" empty="No skill overlap found." />
                <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Missing
                </p>
                <TagList items={result.skill_match.missing} tone="gap" empty="No skill gaps found." />
              </Panel>

              <Panel title="Experience relevance">
                <div className="grid gap-5 sm:grid-cols-2">
                  <BulletList title="Strong points" items={result.experience_relevance.strong_points} />
                  <BulletList title="Weak points" items={result.experience_relevance.weak_points} />
                </div>
              </Panel>

              <Panel title="Suggestions">
                <ol className="space-y-2 text-sm">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
                      <span className="text-accent">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </Panel>
            </>
          ) : (
            <Panel title="Result">
              <p className="text-sm text-muted-foreground">
                Your score, matched and missing terms, and a short fix list appear here.
              </p>
            </Panel>
          )}

          {history.length > 0 ? (
            <Panel title="Recent analyses (SQLite)">
              <p className="mb-3 text-xs text-muted-foreground">
                Previous analyses for this document type saved in SQLite:
              </p>
              <div className="divide-y divide-border rounded-sm border border-border">
                {history.map((item) => {
                  const isSelected = item.id === (selectedHistoryId || (!selectedHistoryId && response?.ok && history[0]?.id === item.id ? item.id : ""));
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 text-xs transition-colors ${
                        isSelected ? "bg-surface font-medium" : "hover:bg-surface"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="font-semibold text-primary">{item.ats_score}%</span>
                        <span className="shrink-0 text-muted-foreground">
                          {new Date(item.created_at).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                        <span className="truncate text-muted-foreground">
                          {item.job_description ? item.job_description.slice(0, 32) + "…" : "Analysis"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="ml-2 shrink-0 font-medium text-primary hover:underline"
                        onClick={() => setSelectedHistoryId(item.id)}
                      >
                        {item.id === selectedHistoryId ? "Viewing" : "Review"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      {items.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">None noted.</p>
      )}
    </div>
  );
}
