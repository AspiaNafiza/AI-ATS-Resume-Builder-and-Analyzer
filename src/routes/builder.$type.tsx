import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Layers,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAuth, useClerk } from "@clerk/tanstack-react-start";
import {
  buildDocument,
  rewriteSummary,
  listMyDocuments,
  saveMyDocument,
  deleteMyDocument,
} from "@/lib/arie.functions";
import { builderCopy, docLabel, isSlug, slugToType, type DocSlug } from "@/lib/doc-meta";
import { DEMO_DOCS } from "@/lib/demo-docs";
import { exportDocumentToPdf, exportCvPdf, exportCoverLetterPdf } from "@/lib/pdf-export";
import { DocumentPreview, toPlainText } from "@/components/app/DocumentPreview";
import {
  DocumentEditor,
  emptyDoc,
  normalizeDoc,
  normalizeLegacyDoc,
} from "@/components/app/DocumentEditor";
import { ErrorNotice, Loader, Panel, SectionHeader } from "@/components/app/primitives";
import type { BuilderResult, UserDocumentItem } from "@/lib/schemas";

export const Route = createFileRoute("/builder/$type")({
  beforeLoad: ({ params }) => {
    if (!isSlug(params.type)) {
      throw redirect({
        to: "/builder/$type",
        params: { type: "resume" },
      });
    }
  },
  head: ({ params }) => {
    const slug = isSlug(params.type) ? params.type : "resume";
    const copy = builderCopy[slug];
    return {
      meta: [
        { title: `${copy.title} — ATS Resume Suite` },
        { name: "description", content: copy.description },
        { property: "og:title", content: `${copy.title} — ATS Resume Suite` },
        { property: "og:description", content: copy.description },
      ],
    };
  },
  component: BuilderScreen,
});

function BuilderScreen() {
  const { type } = Route.useParams();
  const slug = type as DocSlug;
  return <BuilderBody key={slug} slug={slug} />;
}

function BuilderBody({ slug }: { slug: DocSlug }) {
  const copy = builderCopy[slug];
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const urlDocId =
    typeof window !== "undefined"
      ? (new URLSearchParams(window.location.search).get("docId") ?? undefined)
      : undefined;

  const listDocs = useServerFn(listMyDocuments);
  const saveMyDoc = useServerFn(saveMyDocument);
  const deleteMyDoc = useServerFn(deleteMyDocument);

  const demoDoc = DEMO_DOCS[slug];
  const [userDocs, setUserDocs] = useState<UserDocumentItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState(`Demo ${docLabel[slug]}`);
  const [profile, setProfile] = useState(
    demoDoc.personal?.headline
      ? `Demonstration profile for ${demoDoc.personal.fullName || "Candidate"} (${demoDoc.personal.headline}).`
      : "",
  );
  const [targetRole, setTargetRole] = useState(demoDoc.personal?.headline || "");
  const [jobDescription, setJobDescription] = useState("");
  const [doc, setDoc] = useState<BuilderResult | null>(demoDoc);
  const [includeCoverLetter, setIncludeCoverLetter] = useState<boolean>(() => {
    if (slug === "cv") {
      return Boolean(
        demoDoc.sections?.cover_letter && demoDoc.sections.cover_letter.trim().length > 0,
      );
    }
    return false;
  });
  const [tab, setTab] = useState<"details" | "edit">("details");
  const [copied, setCopied] = useState(false);
  const [copiedCv, setCopiedCv] = useState(false);
  const [copiedCl, setCopiedCl] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Intercept edit actions for unauthenticated users
  const requireAuth = (actionName = "edit this document") => {
    if (!isSignedIn) {
      toast.info(`Please sign in to ${actionName}.`);
      openSignIn();
      return true;
    }
    return false;
  };

  // Load document data depending on auth status
  useEffect(() => {
    if (!isAuthLoaded) return;
    let cancelled = false;

    async function init() {
      if (!isSignedIn) {
        // Logged-out state: show demo document in read-only mode
        const demo = DEMO_DOCS[slug];
        if (!cancelled) {
          setUserDocs([]);
          setActiveDocId(null);
          setDocTitle(`Demo ${docLabel[slug]}`);
          setProfile(
            demo.personal?.headline
              ? `Demonstration profile for ${demo.personal.fullName || "Candidate"} (${demo.personal.headline}).`
              : "",
          );
          setTargetRole(demo.personal?.headline || "");
          setJobDescription("");
          setDoc(demo);
          if (slug === "cv") {
            setIncludeCoverLetter(
              Boolean(demo.sections?.cover_letter && demo.sections.cover_letter.trim().length > 0),
            );
          }
          setSavedAt(null);
          setLoaded(true);
        }
        return;
      }

      // Logged-in state: fetch user's documents of this type
      try {
        const res = await listDocs({ data: { documentType: slugToType(slug) } });
        if (cancelled) return;

        if (res.ok && res.data && res.data.length > 0) {
          const list = res.data;
          setUserDocs(list);
          const matched = (urlDocId && list.find((d) => d.id === urlDocId)) || list[0];
          if (matched) {
            setActiveDocId(matched.id);
            setDocTitle(matched.title);
            setProfile(matched.profile || "");
            setTargetRole(matched.targetRole || "");
            setJobDescription(matched.jobDescription || "");
            if (matched.doc) {
              const norm = normalizeLegacyDoc(matched.doc, slugToType(slug));
              setDoc(norm);
              if (slug === "cv") {
                setIncludeCoverLetter(
                  Boolean(
                    norm.sections.cover_letter && norm.sections.cover_letter.trim().length > 0,
                  ),
                );
              }
              setTab("edit");
            } else {
              setDoc(null);
              setTab("details");
            }
            if (matched.updatedAt) {
              setSavedAt(new Date(matched.updatedAt));
            }
          }
        } else {
          // New instance for this user with fresh empty fields
          setUserDocs([]);
          setActiveDocId(null);
          setDocTitle(`My ${docLabel[slug]}`);
          setProfile("");
          setTargetRole("");
          setJobDescription("");
          setDoc(null);
          if (slug === "cv") setIncludeCoverLetter(false);
          setTab("details");
          setSavedAt(null);
        }
      } catch {
        // Fallback to fresh blank on error
        setUserDocs([]);
        setActiveDocId(null);
        setDocTitle(`My ${docLabel[slug]}`);
        setProfile("");
        setTargetRole("");
        setJobDescription("");
        setDoc(null);
        if (slug === "cv") setIncludeCoverLetter(false);
        setTab("details");
      }

      if (!cancelled) {
        setLoaded(true);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [slug, isSignedIn, isAuthLoaded, urlDocId]);

  // Autosave to SQLite (debounced 600ms) only when signed in
  useEffect(() => {
    if (!loaded || !isSignedIn) return;
    if (!profile.trim() && !targetRole.trim() && !jobDescription.trim() && !doc) return;

    const t = setTimeout(async () => {
      try {
        const res = await saveMyDoc({
          data: {
            id: activeDocId || undefined,
            documentType: slugToType(slug),
            title: docTitle.trim() || `My ${docLabel[slug]}`,
            profile,
            targetRole,
            jobDescription,
            doc,
          },
        });
        if (res.ok) {
          setActiveDocId(res.data.id);
          setSavedAt(new Date(res.data.updatedAt));
          setUserDocs((prev) => {
            const idx = prev.findIndex((d) => d.id === res.data.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = res.data;
              return updated;
            }
            return [res.data, ...prev];
          });
        }
      } catch {
        /* ignore network issues during autosave */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [doc, profile, targetRole, jobDescription, docTitle, activeDocId, loaded, isSignedIn, slug]);

  const build = useServerFn(buildDocument);
  const mutation = useMutation({
    mutationFn: () =>
      build({
        data: {
          documentType: slugToType(slug),
          profile: profile.trim(),
          targetRole: targetRole.trim(),
          jobDescription: jobDescription.trim(),
          includeCoverLetter: slug === "cv" ? includeCoverLetter : false,
        },
      }),
    onSuccess: (res) => {
      if (res.ok) {
        setDoc(res.result);
        if (slug === "cv") {
          setIncludeCoverLetter(
            Boolean(
              res.result.sections.cover_letter &&
              res.result.sections.cover_letter.trim().length > 0,
            ),
          );
        }
        setTab("edit");
        toast.success(
          slug === "cv" && res.result.sections.cover_letter
            ? "CV and tailored Cover Letter generated!"
            : `${docLabel[slug]} generated!`,
        );
      }
    },
  });

  const rewrite = useServerFn(rewriteSummary);
  const rewriteMutation = useMutation({
    mutationFn: async () => {
      if (!doc) return;
      return await rewrite({
        data: {
          documentType: slugToType(slug),
          currentSummary: doc.sections.summary.trim(),
          documentText: toPlainText(normalizeDoc(doc)) || profile.trim(),
          profile: profile.trim(),
          jobDescription: jobDescription.trim(),
          targetRole: targetRole.trim(),
        },
      });
    },
    onSuccess: (res) => {
      if (res?.ok) {
        setDoc((prev) =>
          prev
            ? {
                ...prev,
                sections: {
                  ...prev.sections,
                  summary: res.summary,
                },
              }
            : prev,
        );
        toast.success("Summary improved with AI");
      } else if (res && !res.ok) {
        toast.error(res.error || "Could not improve summary.");
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to rewrite summary");
    },
  });

  const switchDocument = (targetId: string) => {
    const found = userDocs.find((d) => d.id === targetId);
    if (!found) return;
    setActiveDocId(found.id);
    setDocTitle(found.title);
    setProfile(found.profile || "");
    setTargetRole(found.targetRole || "");
    setJobDescription(found.jobDescription || "");
    const norm = found.doc ? normalizeLegacyDoc(found.doc, slugToType(slug)) : null;
    setDoc(norm);
    if (slug === "cv") {
      setIncludeCoverLetter(
        Boolean(norm?.sections.cover_letter && norm.sections.cover_letter.trim().length > 0),
      );
    }
    setSavedAt(found.updatedAt ? new Date(found.updatedAt) : null);
    setTab(found.doc ? "edit" : "details");
  };

  const createNewDocument = () => {
    setActiveDocId(null);
    setDocTitle(`New ${docLabel[slug]}`);
    setProfile("");
    setTargetRole("");
    setJobDescription("");
    setDoc(null);
    if (slug === "cv") {
      setIncludeCoverLetter(false);
    }
    setSavedAt(null);
    setTab("details");
  };

  const handleDeleteDocument = async () => {
    if (!activeDocId) return;
    if (!confirm(`Delete "${docTitle}"? This cannot be undone.`)) return;
    try {
      const res = await deleteMyDoc({ data: { id: activeDocId } });
      if (res.ok) {
        toast.success("Document deleted");
        const remaining = userDocs.filter((d) => d.id !== activeDocId);
        setUserDocs(remaining);
        const next = remaining[0];
        if (next) {
          setActiveDocId(next.id);
          setDocTitle(next.title);
          setProfile(next.profile || "");
          setTargetRole(next.targetRole || "");
          setJobDescription(next.jobDescription || "");
          setDoc(next.doc ? normalizeLegacyDoc(next.doc, slugToType(slug)) : null);
          setSavedAt(next.updatedAt ? new Date(next.updatedAt) : null);
          setTab(next.doc ? "edit" : "details");
        } else {
          createNewDocument();
        }
      } else {
        toast.error(res.error || "Failed to delete document");
      }
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleDocChange = (newDoc: BuilderResult) => {
    if (requireAuth("edit this document")) return;
    setDoc(newDoc);
    if (slug === "cv") {
      setIncludeCoverLetter(
        Boolean(newDoc.sections?.cover_letter && newDoc.sections.cover_letter.trim().length > 0),
      );
    }
  };

  const handleToggleCoverLetter = (enable: boolean) => {
    setIncludeCoverLetter(enable);
    if (doc) {
      if (enable) {
        if (!doc.sections.cover_letter || !doc.sections.cover_letter.trim()) {
          const p = doc.personal;
          const candidateName = p?.fullName || "Candidate";
          const role = targetRole || p?.headline || "Position";
          const templ = `[Your Full Name]

[City, State ZIP] | [Phone] | [Email] | [LinkedIn URL]

${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

Dear Hiring Team,

I am applying for the ${role} position. I am an experienced researcher and professional with deep expertise in my field and a proven track record of rigorous scholarship, technical leadership, and impactful results.

In my recent projects, I spearheaded core initiatives, presented at international conferences, and collaborated across cross-disciplinary teams. My background and specialized capabilities map directly to the requirements outlined in the posting.

I would welcome the opportunity to discuss how my qualifications align with your organizational goals. Thank you for your time and consideration.

Sincerely,

${candidateName}`;
          setDoc({
            ...doc,
            sections: {
              ...doc.sections,
              cover_letter: templ,
            },
          });
        }
        toast.success("Cover letter included with CV");
      } else {
        setDoc({
          ...doc,
          sections: {
            ...doc.sections,
            cover_letter: "",
          },
        });
        toast.info("Cover letter removed from CV");
      }
    }
  };

  const tooShort = profile.trim().length < 30;
  const response = mutation.data;
  const error = mutation.isError
    ? "We couldn't reach the writing service. Please try again."
    : response && !response.ok
      ? response.error
      : null;

  const preview = useMemo(() => (doc ? normalizeDoc(doc) : null), [doc]);

  const tabBtn = (active: boolean) =>
    `border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
      active
        ? "border-accent text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="container-page py-10 md:py-14">
      <SectionHeader eyebrow={docLabel[slug]} title={copy.title} description={copy.description} />

      {!isSignedIn ? (
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Viewing Sample ATS-Optimized {docLabel[slug]}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              You are currently viewing a live demonstration. Sign in to edit fields, generate AI
              revisions, and automatically save multiple versions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openSignIn()}
            className="inline-flex shrink-0 items-center justify-center rounded-sm bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Sign in to customize
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Document:</span>
            </span>
            <select
              value={activeDocId || "new"}
              onChange={(e) => {
                if (e.target.value === "new") {
                  createNewDocument();
                } else {
                  switchDocument(e.target.value);
                }
              }}
              className="rounded-sm border border-input bg-background px-2.5 py-1 text-xs font-medium outline-none focus:border-ring"
            >
              {userDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id.startsWith("cl_from_") ? "🔗 " : ""}
                  {d.title} (
                  {new Date(d.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  )
                </option>
              ))}
              <option value="new">+ Create new {docLabel[slug]}</option>
            </select>

            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document title"
              className="rounded-sm border border-input bg-background px-2.5 py-1 text-xs font-medium outline-none focus:border-ring sm:w-56"
            />

            <button
              type="button"
              onClick={createNewDocument}
              className="inline-flex items-center gap-1 rounded-sm border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-secondary transition-colors"
              title="Create a new blank document"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>

            {activeDocId ? (
              <button
                type="button"
                onClick={handleDeleteDocument}
                className="inline-flex items-center gap-1 rounded-sm border border-input bg-background px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete this document"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            ) : null}
          </div>

          <span className="text-xs text-muted-foreground">
            {savedAt
              ? `Autosaved ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Unsaved draft"}
          </span>
        </div>
      )}

      {slug === "cover-letter" && activeDocId?.startsWith("cl_from_") ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <FileText className="h-4 w-4 text-accent shrink-0" />
            <span>
              This Cover Letter is <strong>connected to your CV</strong>. Edits made here
              automatically synchronize with your CV.
            </span>
          </div>
          <Link
            to="/builder/$type"
            params={{ type: "cv" }}
            search={{ docId: activeDocId.replace("cl_from_", "") }}
            className="inline-flex items-center gap-1 font-semibold text-accent hover:underline shrink-0"
          >
            <span>Open Connected CV</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}

      {slug === "cv" &&
      (includeCoverLetter || (doc?.sections.cover_letter && doc.sections.cover_letter.trim())) ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <FileText className="h-4 w-4 text-accent shrink-0" />
            <span>
              Cover Letter is <strong>included & connected</strong> with this CV. You can download
              both separately or view in the Cover Letter page.
            </span>
          </div>
          <Link
            to="/builder/$type"
            params={{ type: "cover-letter" }}
            search={{ docId: activeDocId ? `cl_from_${activeDocId}` : undefined }}
            className="inline-flex items-center gap-1 font-semibold text-accent hover:underline shrink-0"
          >
            <span>View in Cover Letter Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4 border-b border-border">
            <div className="flex gap-6">
              <button
                type="button"
                className={tabBtn(tab === "details")}
                onClick={() => setTab("details")}
              >
                1. Your details
              </button>
              <button
                type="button"
                className={tabBtn(tab === "edit")}
                onClick={() => {
                  if (!doc) setDoc(emptyDoc(slugToType(slug)));
                  setTab("edit");
                }}
              >
                2. Edit manually
              </button>
            </div>
          </div>

          {tab === "details" ? (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (requireAuth("generate documents with AI")) return;
                if (!tooShort) mutation.mutate();
              }}
            >
              <Panel title="Your details">
                <label className="block text-sm font-medium" htmlFor="targetRole">
                  Target role
                </label>
                <input
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => {
                    if (requireAuth("edit target role")) return;
                    setTargetRole(e.target.value);
                  }}
                  onFocus={() => {
                    if (!isSignedIn) requireAuth("edit target role");
                  }}
                  placeholder="e.g. Operations Analyst, Acme Logistics"
                  className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                />

                <label className="mt-5 block text-sm font-medium" htmlFor="profile">
                  Background, experience and education
                </label>
                <textarea
                  id="profile"
                  value={profile}
                  onChange={(e) => {
                    if (requireAuth("edit your profile")) return;
                    setProfile(e.target.value);
                  }}
                  onFocus={() => {
                    if (!isSignedIn) requireAuth("edit your profile");
                  }}
                  rows={14}
                  placeholder={copy.placeholder}
                  className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Only what you write here is used. Nothing is invented.
                </p>
              </Panel>

              <Panel title="Job description (optional)">
                <textarea
                  value={jobDescription}
                  onChange={(e) => {
                    if (requireAuth("edit job description")) return;
                    setJobDescription(e.target.value);
                  }}
                  onFocus={() => {
                    if (!isSignedIn) requireAuth("edit job description");
                  }}
                  rows={8}
                  placeholder="Paste the posting to tailor wording and keywords."
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-ring"
                />
              </Panel>

              {/* COVER LETTER TOGGLE BUTTON IN CV BUILDER */}
              {slug === "cv" ? (
                <div className="rounded-lg border border-border bg-card p-4 transition-all hover:border-accent/50 shadow-xs">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-accent" />
                        <span className="text-sm font-semibold text-foreground">
                          Include Cover Letter with CV
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            includeCoverLetter
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {includeCoverLetter ? "Turned ON" : "Turned OFF"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {includeCoverLetter
                          ? "Generates a tailored executive cover letter with the CV. Both can be downloaded separately or together, and synced to your Cover Letter page."
                          : "Generates only the CV. No cover letter will be included."}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={includeCoverLetter}
                      onClick={() => handleToggleCoverLetter(!includeCoverLetter)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        includeCoverLetter ? "bg-accent" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                          includeCoverLetter ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={tooShort || mutation.isPending}
                  className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {mutation.isPending ? "Writing…" : `Generate ${docLabel[slug].toLowerCase()}`}
                </button>
                {tooShort ? (
                  <span className="text-xs text-muted-foreground">
                    Add a bit more detail, or write it yourself in “Edit manually”.
                  </span>
                ) : null}
                {mutation.isPending ? <Loader label="This usually takes under a minute." /> : null}
              </div>
              {doc && !mutation.isPending ? (
                <p className="text-xs text-muted-foreground">
                  Generating again replaces your current draft.
                </p>
              ) : null}
            </form>
          ) : doc ? (
            <Panel
              title="Edit document"
              aside={
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                  onClick={() => {
                    if (requireAuth("clear this document")) return;
                    if (confirm("Clear this document and start over?"))
                      setDoc(emptyDoc(slugToType(slug)));
                  }}
                >
                  Clear
                </button>
              }
            >
              <div
                onClickCapture={(e) => {
                  if (!isSignedIn) {
                    e.preventDefault();
                    e.stopPropagation();
                    requireAuth("edit this document");
                  }
                }}
              >
                <DocumentEditor
                  doc={doc}
                  onChange={handleDocChange}
                  onRewriteSummary={() => {
                    if (requireAuth("improve summary with AI")) return;
                    rewriteMutation.mutate();
                  }}
                  isRewriting={rewriteMutation.isPending}
                />
              </div>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {error ? <ErrorNotice message={error} /> : null}
          <Panel
            title="Live preview"
            aside={
              preview ? (
                <div className="flex flex-wrap items-center gap-2">
                  {slug === "cv" &&
                  preview.sections.cover_letter &&
                  preview.sections.cover_letter.trim() ? (
                    <>
                      {/* Separate Downloads for CV and Cover Letter */}
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        onClick={() => {
                          const base = (
                            preview.personal?.fullName ||
                            docTitle ||
                            "Candidate"
                          ).replace(/[^a-zA-Z0-9_-]/g, "_");
                          exportCvPdf(preview, `${base}_CV.pdf`);
                          toast.success("CV PDF downloaded successfully!");
                        }}
                        title="Download only the CV without the cover letter"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download CV (PDF)</span>
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-sm border border-input bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
                        onClick={() => {
                          const base = (
                            preview.personal?.fullName ||
                            docTitle ||
                            "Candidate"
                          ).replace(/[^a-zA-Z0-9_-]/g, "_");
                          exportCoverLetterPdf(preview, `${base}_Cover_Letter.pdf`);
                          toast.success("Cover Letter PDF downloaded successfully!");
                        }}
                        title="Download only the Cover Letter as a standalone PDF"
                      >
                        <FileText className="h-3.5 w-3.5 text-accent" />
                        <span>Download Cover Letter (PDF)</span>
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-sm border border-input px-2.5 py-1 text-xs font-medium transition-colors hover:bg-secondary text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          const base = (
                            preview.personal?.fullName ||
                            docTitle ||
                            "Document"
                          ).replace(/[^a-zA-Z0-9_-]/g, "_");
                          exportDocumentToPdf(preview, {
                            includeCoverLetter: true,
                            filename: `${base}_CV_with_Cover_Letter.pdf`,
                          });
                          toast.success("Combined PDF downloaded successfully!");
                        }}
                        title="Download both CV and Cover Letter combined into a single PDF"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span>Both (PDF)</span>
                      </button>

                      {/* Separate Plain Text Copies */}
                      <button
                        type="button"
                        className="rounded-sm border border-input px-2 py-1 text-xs font-medium transition-colors hover:bg-secondary"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            toPlainText(preview, { includeCoverLetter: false }),
                          );
                          setCopiedCv(true);
                          setTimeout(() => setCopiedCv(false), 2000);
                        }}
                        title="Copy plain text of CV only"
                      >
                        {copiedCv ? "Copied CV" : "Copy CV"}
                      </button>

                      <button
                        type="button"
                        className="rounded-sm border border-input px-2 py-1 text-xs font-medium transition-colors hover:bg-secondary"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            toPlainText(preview, { coverLetterOnly: true }),
                          );
                          setCopiedCl(true);
                          setTimeout(() => setCopiedCl(false), 2000);
                        }}
                        title="Copy plain text of Cover Letter only"
                      >
                        {copiedCl ? "Copied Letter" : "Copy Letter"}
                      </button>

                      <Link
                        to="/builder/$type"
                        params={{ type: "cover-letter" }}
                        search={{ docId: activeDocId ? `cl_from_${activeDocId}` : undefined }}
                        className="inline-flex items-center gap-1 rounded-sm border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                        title="Open this cover letter in the Cover Letter Builder page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Cover Letter page</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        onClick={() => {
                          exportDocumentToPdf(
                            preview,
                            `${(preview.personal?.fullName || docTitle || "Document").replace(/[^a-zA-Z0-9_-]/g, "_")}_${docLabel[slug]}.pdf`,
                          );
                          toast.success("PDF downloaded successfully!");
                        }}
                        title="Download ATS-friendly PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        type="button"
                        className="rounded-sm border border-input px-3 py-1 text-xs font-medium transition-colors hover:bg-secondary"
                        onClick={async () => {
                          await navigator.clipboard.writeText(toPlainText(preview));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? "Copied" : "Copy plain text"}
                      </button>
                    </>
                  )}
                </div>
              ) : null
            }
          >
            <div className="lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto">
              {preview ? (
                <DocumentPreview doc={preview} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your document appears here and updates as you type. It stays plain text — no
                  tables, columns or icons, so applicant tracking systems can read every line.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
