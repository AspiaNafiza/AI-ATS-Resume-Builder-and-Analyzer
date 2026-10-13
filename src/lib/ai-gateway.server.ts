const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

// List of Gemini models to try in order (ensures resilience against temporary 503 spikes)
const DEFAULT_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

export type JsonSchema = Record<string, unknown>;
export type ResponsesInput = string | Array<Record<string, unknown>>;

export class GatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Strips properties that are required by OpenAI strict schemas (like `additionalProperties`)
 * but are rejected as unknown fields by Gemini's Schema proto parser.
 */
function cleanGeminiSchema(schema: unknown): unknown {
  if (!schema || typeof schema !== "object") return schema;
  if (Array.isArray(schema)) return schema.map(cleanGeminiSchema);

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema as Record<string, unknown>)) {
    // Unsupported fields in Gemini REST Schema proto
    if (
      key === "additionalProperties" ||
      key === "$schema" ||
      key === "minimum" ||
      key === "maximum"
    ) {
      continue;
    }
    cleaned[key] = cleanGeminiSchema(value);
  }
  return cleaned;
}

/**
 * Convert the app's input format into Gemini `contents` + optional
 * inline_data parts (for PDF analysis).
 */
function buildContents(input: ResponsesInput): Array<Record<string, unknown>> {
  if (typeof input === "string") {
    return [{ role: "user", parts: [{ text: input }] }];
  }

  return input.map((msg) => {
    const content = msg["content"];
    if (Array.isArray(content)) {
      const parts = content.map((part: Record<string, unknown>) => {
        if (part["type"] === "input_text") {
          return { text: part["text"] as string };
        }
        if (part["type"] === "input_file") {
          const fileData = (part["file_data"] as string) || "";
          const commaIdx = fileData.indexOf(",");
          const base64 = commaIdx >= 0 ? fileData.slice(commaIdx + 1) : fileData;
          return {
            inline_data: {
              mime_type: "application/pdf",
              data: base64,
            },
          };
        }
        return { text: JSON.stringify(part) };
      });
      return { role: "user", parts };
    }
    return { role: (msg["role"] as string) || "user", parts: [{ text: JSON.stringify(content) }] };
  });
}

/**
 * Calls Gemini with schema cleanup and automatic model fallback.
 */
export async function generateJson<T>(params: {
  instructions: string;
  input: ResponsesInput;
  schemaName: string;
  schema: JsonSchema;
}): Promise<T> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    throw new GatewayError(401, "AI is not configured. Please set GEMINI_API_KEY in .env.local.");
  }

  const preferredModel = process.env["GEMINI_MODEL"];
  const candidateModels = preferredModel
    ? [preferredModel, ...DEFAULT_MODELS.filter((m) => m !== preferredModel)]
    : DEFAULT_MODELS;

  const sanitizedSchema = cleanGeminiSchema(params.schema);
  const contents = buildContents(params.input);

  let lastError: GatewayError | null = null;

  for (const model of candidateModels) {
    const url = `${GEMINI_BASE}/models/${model}:generateContent`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: params.instructions }],
          },
          contents,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: sanitizedSchema,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        let message = body;
        try {
          const parsed = JSON.parse(body);
          message = parsed?.error?.message ?? parsed?.message ?? body;
        } catch {
          /* raw body */
        }

        // If high demand (503) or rate-limited (429) or model not found (404), try the next candidate model
        if (res.status === 503 || res.status === 429 || res.status === 404) {
          lastError = new GatewayError(res.status, message || `Model ${model} unavailable.`);
          continue;
        }

        if (res.status === 400 || res.status === 403) {
          throw new GatewayError(res.status, message || "Invalid request or API key.");
        }

        throw new GatewayError(res.status, message || "The AI service failed.");
      }

      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text?.trim()) {
        const blockReason = json?.promptFeedback?.blockReason;
        if (blockReason) {
          throw new GatewayError(400, `Request blocked by Gemini safety filter: ${blockReason}`);
        }
        throw new GatewayError(502, "Gemini returned an empty result. Please try again.");
      }

      return JSON.parse(text) as T;
    } catch (err: unknown) {
      if (err instanceof GatewayError) {
        // If it's a 503/429/404, we continue loop
        if (err.status === 503 || err.status === 429 || err.status === 404) {
          lastError = err;
          continue;
        }
        throw err;
      }
      lastError = new GatewayError(500, err instanceof Error ? err.message : "Unknown error");
    }
  }

  throw lastError || new GatewayError(503, "All Gemini models are temporarily busy. Please retry.");
}
