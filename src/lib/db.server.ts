import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import type { AnalyzerResult, BuilderResult, DbAnalysis, DbDocument, DocumentType, UserDocumentItem, UserStats } from "./schemas";
export type { DbAnalysis, DbDocument, UserDocumentItem, UserStats };

const DATA_DIR = path.resolve(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "ats-suite.sqlite");

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS documents (
        slug TEXT PRIMARY KEY,
        document_type TEXT NOT NULL,
        profile TEXT NOT NULL DEFAULT '',
        target_role TEXT NOT NULL DEFAULT '',
        job_description TEXT NOT NULL DEFAULT '',
        doc_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        target TEXT NOT NULL,
        job_description TEXT NOT NULL,
        document_text TEXT NOT NULL,
        ats_score INTEGER NOT NULL,
        result_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_analyses_target_created ON analyses(target, created_at DESC);

      CREATE TABLE IF NOT EXISTS user_documents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        document_type TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT 'Untitled Document',
        profile TEXT NOT NULL DEFAULT '',
        target_role TEXT NOT NULL DEFAULT '',
        job_description TEXT NOT NULL DEFAULT '',
        doc_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_user_documents_user ON user_documents(user_id, document_type, updated_at DESC);

      CREATE TABLE IF NOT EXISTS user_analyses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        document_id TEXT NOT NULL DEFAULT '',
        target TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        job_description TEXT NOT NULL DEFAULT '',
        document_text TEXT NOT NULL,
        ats_score INTEGER NOT NULL,
        result_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_user_analyses_user ON user_analyses(user_id, target, created_at DESC);
    `);
  }
  return dbInstance;
}

export function getDocumentFromDb(slug: string): DbDocument | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM documents WHERE slug = ?");
  const row = stmt.get(slug) as Record<string, unknown> | undefined;
  if (!row) return null;

  let doc: BuilderResult | null = null;
  if (typeof row["doc_json"] === "string" && row["doc_json"].trim()) {
    try {
      doc = JSON.parse(row["doc_json"]) as BuilderResult;
    } catch {
      doc = null;
    }
  }

  return {
    slug: String(row["slug"] ?? slug),
    document_type: String(row["document_type"] ?? "resume"),
    profile: String(row["profile"] ?? ""),
    target_role: String(row["target_role"] ?? ""),
    job_description: String(row["job_description"] ?? ""),
    doc,
    created_at: String(row["created_at"] ?? ""),
    updated_at: String(row["updated_at"] ?? ""),
  };
}

export function saveDocumentToDb(params: {
  slug: string;
  documentType: string;
  profile: string;
  targetRole: string;
  jobDescription: string;
  doc?: BuilderResult | null;
}): DbDocument {
  const db = getDatabase();
  const now = new Date().toISOString();
  const docResult = params.doc ?? null;
  const docJson = docResult ? JSON.stringify(docResult) : "{}";

  const existing = getDocumentFromDb(params.slug);
  if (existing) {
    const updateStmt = db.prepare(`
      UPDATE documents
      SET document_type = ?,
          profile = ?,
          target_role = ?,
          job_description = ?,
          doc_json = ?,
          updated_at = ?
      WHERE slug = ?
    `);
    updateStmt.run(
      params.documentType,
      params.profile,
      params.targetRole,
      params.jobDescription,
      docJson,
      now,
      params.slug
    );
  } else {
    const insertStmt = db.prepare(`
      INSERT INTO documents (slug, document_type, profile, target_role, job_description, doc_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(
      params.slug,
      params.documentType,
      params.profile,
      params.targetRole,
      params.jobDescription,
      docJson,
      now,
      now
    );
  }

  return {
    slug: params.slug,
    document_type: params.documentType,
    profile: params.profile,
    target_role: params.targetRole,
    job_description: params.jobDescription,
    doc: docResult,
    created_at: existing ? existing.created_at : now,
    updated_at: now,
  };
}

export function saveAnalysisToDb(params: {
  id?: string;
  target: string;
  jobDescription: string;
  documentText: string;
  result: AnalyzerResult;
}): DbAnalysis {
  const db = getDatabase();
  const id = params.id || `an_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const resultJson = JSON.stringify(params.result);

  const insertStmt = db.prepare(`
    INSERT INTO analyses (id, target, job_description, document_text, ats_score, result_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertStmt.run(
    id,
    params.target,
    params.jobDescription,
    params.documentText,
    params.result.ats_score,
    resultJson,
    now
  );

  return {
    id,
    target: params.target,
    job_description: params.jobDescription,
    document_text: params.documentText,
    ats_score: params.result.ats_score,
    result: params.result,
    created_at: now,
  };
}

export function getRecentAnalysesFromDb(target?: string, limit: number = 10): DbAnalysis[] {
  const db = getDatabase();
  const query = target
    ? "SELECT * FROM analyses WHERE target = ? ORDER BY created_at DESC LIMIT ?"
    : "SELECT * FROM analyses ORDER BY created_at DESC LIMIT ?";
  const stmt = db.prepare(query);
  const rows = (target ? stmt.all(target, limit) : stmt.all(limit)) as Record<string, unknown>[];

  return rows.map((row) => {
    let parsedResult: AnalyzerResult;
    try {
      parsedResult = JSON.parse(String(row["result_json"] || "{}")) as AnalyzerResult;
    } catch {
      parsedResult = {
        ats_score: Number(row["ats_score"] ?? 0),
        keyword_match: { found: [], missing: [] },
        skill_match: { matched: [], missing: [] },
        experience_relevance: { strong_points: [], weak_points: [] },
        suggestions: [],
      };
    }

    return {
      id: String(row["id"] ?? ""),
      target: String(row["target"] ?? ""),
      job_description: String(row["job_description"] ?? ""),
      document_text: String(row["document_text"] ?? ""),
      ats_score: Number(row["ats_score"] ?? 0),
      result: parsedResult,
      created_at: String(row["created_at"] ?? ""),
    };
  });
}

function parseDocJson(raw: unknown): BuilderResult | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as BuilderResult;
  } catch {
    return null;
  }
}

export function listUserDocuments(userId: string, documentType?: string): UserDocumentItem[] {
  const db = getDatabase();
  const query = documentType
    ? "SELECT * FROM user_documents WHERE user_id = ? AND document_type = ? ORDER BY updated_at DESC"
    : "SELECT * FROM user_documents WHERE user_id = ? ORDER BY updated_at DESC";
  const stmt = db.prepare(query);
  const rows = (documentType ? stmt.all(userId, documentType) : stmt.all(userId)) as Record<string, unknown>[];

  return rows.map((r) => ({
    id: String(r["id"]),
    userId: String(r["user_id"]),
    documentType: String(r["document_type"]) as DocumentType,
    title: String(r["title"] || "Untitled Document"),
    profile: String(r["profile"] || ""),
    targetRole: String(r["target_role"] || ""),
    jobDescription: String(r["job_description"] || ""),
    doc: parseDocJson(r["doc_json"]),
    createdAt: String(r["created_at"]),
    updatedAt: String(r["updated_at"]),
  }));
}

export function getUserDocument(userId: string, id: string): UserDocumentItem | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM user_documents WHERE user_id = ? AND id = ?");
  const r = stmt.get(userId, id) as Record<string, unknown> | undefined;
  if (!r) return null;

  return {
    id: String(r["id"]),
    userId: String(r["user_id"]),
    documentType: String(r["document_type"]) as DocumentType,
    title: String(r["title"] || "Untitled Document"),
    profile: String(r["profile"] || ""),
    targetRole: String(r["target_role"] || ""),
    jobDescription: String(r["job_description"] || ""),
    doc: parseDocJson(r["doc_json"]),
    createdAt: String(r["created_at"]),
    updatedAt: String(r["updated_at"]),
  };
}

export function getLatestUserDocument(userId: string, documentType: string): UserDocumentItem | null {
  const db = getDatabase();
  const stmt = db.prepare(
    "SELECT * FROM user_documents WHERE user_id = ? AND document_type = ? ORDER BY updated_at DESC LIMIT 1"
  );
  const r = stmt.get(userId, documentType) as Record<string, unknown> | undefined;
  if (!r) return null;

  return {
    id: String(r["id"]),
    userId: String(r["user_id"]),
    documentType: String(r["document_type"]) as DocumentType,
    title: String(r["title"] || "Untitled Document"),
    profile: String(r["profile"] || ""),
    targetRole: String(r["target_role"] || ""),
    jobDescription: String(r["job_description"] || ""),
    doc: parseDocJson(r["doc_json"]),
    createdAt: String(r["created_at"]),
    updatedAt: String(r["updated_at"]),
  };
}

export function saveUserDocument(params: {
  id?: string | undefined;
  userId: string;
  documentType: DocumentType;
  title?: string | undefined;
  profile?: string | undefined;
  targetRole?: string | undefined;
  jobDescription?: string | undefined;
  doc?: BuilderResult | null | undefined;
}): UserDocumentItem {
  const db = getDatabase();
  const now = new Date().toISOString();
  const title = params.title?.trim() || "Untitled Document";
  const profile = params.profile ?? "";
  const targetRole = params.targetRole ?? "";
  const jobDescription = params.jobDescription ?? "";
  const docResult = params.doc ?? null;
  const docJson = docResult ? JSON.stringify(docResult) : "{}";

  if (params.id) {
    const existing = getUserDocument(params.userId, params.id);
    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE user_documents
        SET title = ?,
            document_type = ?,
            profile = ?,
            target_role = ?,
            job_description = ?,
            doc_json = ?,
            updated_at = ?
        WHERE user_id = ? AND id = ?
      `);
      updateStmt.run(
        title,
        params.documentType,
        profile,
        targetRole,
        jobDescription,
        docJson,
        now,
        params.userId,
        params.id
      );

      return {
        id: params.id,
        userId: params.userId,
        documentType: params.documentType,
        title,
        profile,
        targetRole,
        jobDescription,
        doc: docResult,
        createdAt: existing.createdAt,
        updatedAt: now,
      };
    }
  }

  const newId = params.id || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const insertStmt = db.prepare(`
    INSERT INTO user_documents (id, user_id, document_type, title, profile, target_role, job_description, doc_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStmt.run(
    newId,
    params.userId,
    params.documentType,
    title,
    profile,
    targetRole,
    jobDescription,
    docJson,
    now,
    now
  );

  return {
    id: newId,
    userId: params.userId,
    documentType: params.documentType,
    title,
    profile,
    targetRole,
    jobDescription,
    doc: docResult,
    createdAt: now,
    updatedAt: now,
  };
}

export function deleteUserDocument(userId: string, id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM user_documents WHERE user_id = ? AND id = ?");
  stmt.run(userId, id);
  return true;
}

export function saveUserAnalysis(params: {
  userId: string;
  documentId?: string | undefined;
  target: string;
  title?: string | undefined;
  jobDescription: string;
  documentText: string;
  result: AnalyzerResult;
}): DbAnalysis {
  const db = getDatabase();
  const id = `an_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const resultJson = JSON.stringify(params.result);
  const title = params.title || "";
  const docId = params.documentId || "";

  const insertStmt = db.prepare(`
    INSERT INTO user_analyses (id, user_id, document_id, target, title, job_description, document_text, ats_score, result_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStmt.run(
    id,
    params.userId,
    docId,
    params.target,
    title,
    params.jobDescription,
    params.documentText,
    params.result.ats_score,
    resultJson,
    now
  );

  // Also record in legacy analyses table
  try {
    saveAnalysisToDb({
      id,
      target: params.target,
      jobDescription: params.jobDescription,
      documentText: params.documentText,
      result: params.result,
    });
  } catch {
    /* ignore */
  }

  return {
    id,
    target: params.target,
    job_description: params.jobDescription,
    document_text: params.documentText,
    ats_score: params.result.ats_score,
    result: params.result,
    created_at: now,
  };
}

export function listUserAnalyses(userId: string, target?: string, limit: number = 10): DbAnalysis[] {
  const db = getDatabase();
  const query = target
    ? "SELECT * FROM user_analyses WHERE user_id = ? AND target = ? ORDER BY created_at DESC LIMIT ?"
    : "SELECT * FROM user_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT ?";
  const stmt = db.prepare(query);
  const rows = (target ? stmt.all(userId, target, limit) : stmt.all(userId, limit)) as Record<string, unknown>[];

  return rows.map((row) => {
    let parsedResult: AnalyzerResult;
    try {
      parsedResult = JSON.parse(String(row["result_json"] || "{}")) as AnalyzerResult;
    } catch {
      parsedResult = {
        ats_score: Number(row["ats_score"] ?? 0),
        keyword_match: { found: [], missing: [] },
        skill_match: { matched: [], missing: [] },
        experience_relevance: { strong_points: [], weak_points: [] },
        suggestions: [],
      };
    }

    return {
      id: String(row["id"] ?? ""),
      target: String(row["target"] ?? ""),
      job_description: String(row["job_description"] ?? ""),
      document_text: String(row["document_text"] ?? ""),
      ats_score: Number(row["ats_score"] ?? 0),
      result: parsedResult,
      created_at: String(row["created_at"] ?? ""),
    };
  });
}

export function getUserStats(userId: string): UserStats {
  const db = getDatabase();

  const resumes = db.prepare("SELECT COUNT(*) as c FROM user_documents WHERE user_id = ? AND document_type = 'resume'").get(userId) as Record<string, unknown> | undefined;
  const cvs = db.prepare("SELECT COUNT(*) as c FROM user_documents WHERE user_id = ? AND document_type = 'cv'").get(userId) as Record<string, unknown> | undefined;
  const coverLetters = db.prepare("SELECT COUNT(*) as c FROM user_documents WHERE user_id = ? AND document_type = 'cover_letter'").get(userId) as Record<string, unknown> | undefined;
  const analyses = db.prepare("SELECT COUNT(*) as c FROM user_analyses WHERE user_id = ?").get(userId) as Record<string, unknown> | undefined;

  const recentAnStmt = db.prepare("SELECT id, target, ats_score, created_at FROM user_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 5");
  const recentAnRows = recentAnStmt.all(userId) as Record<string, unknown>[];

  const docsStmt = db.prepare("SELECT id, title, document_type, updated_at FROM user_documents WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10");
  const docsRows = docsStmt.all(userId) as Record<string, unknown>[];

  return {
    resumesCount: Number(resumes?.["c"] ?? 0),
    cvsCount: Number(cvs?.["c"] ?? 0),
    coverLettersCount: Number(coverLetters?.["c"] ?? 0),
    analysesCount: Number(analyses?.["c"] ?? 0),
    recentAnalyses: recentAnRows.map((r) => ({
      id: String(r["id"]),
      target: String(r["target"]),
      atsScore: Number(r["ats_score"] ?? 0),
      createdAt: String(r["created_at"]),
    })),
    documents: docsRows.map((r) => ({
      id: String(r["id"]),
      title: String(r["title"] || "Untitled"),
      documentType: String(r["document_type"]) as DocumentType,
      updatedAt: String(r["updated_at"]),
    })),
  };
}
