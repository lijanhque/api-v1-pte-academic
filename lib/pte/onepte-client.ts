// server-only runtime client for external OnePTE-like API
import "server-only";

type HttpMethod = "GET" | "POST";

export type SpeakingTypeCode =
  | "s_read_aloud"
  | "s_repeat_sentence"
  | "s_describe_image"
  | "s_retell_lecture"
  | "s_short_question"
  | "s_respond_situation_academic"
  | "s_summarize_group_discussion";

export type ExternalSpeakingItem = {
  id: string | number; // external id
  title?: string; // display title/text snippet
  text?: string; // full text for RA, etc.
  audioUrl?: string | null; // for RS/RL/ASQ/etc.
  imageUrl?: string | null; // for DI
  durationSec?: number | null; // total duration seconds if provided
  difficulty?: "easy" | "medium" | "hard" | string | null;
  tags?: string[] | null;
  raw?: unknown; // keep original payload for debugging/mapping
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

const BASE_URL = process.env.ONEPTE_API_BASE_URL ?? "";
const TOKEN = process.env.ONEPTE_API_TOKEN ?? "";

if (!BASE_URL) {
  // We don't throw here to allow local dev without credentials, but warn loudly.
  console.warn("[onepte-client] Missing ONEPTE_API_BASE_URL in environment");
}
if (!TOKEN) {
  console.warn("[onepte-client] Missing ONEPTE_API_TOKEN in environment");
}

// Simple request throttle: allow N requests per window (in-memory, per instance)
class SimpleRateLimiter {
  private queue: Array<() => void> = [];
  private active = 0;
  constructor(private maxConcurrent = 4) {}
  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}
const limiter = new SimpleRateLimiter(4);

async function request<T>(
  path: string,
  opts: { method?: HttpMethod; body?: unknown; signal?: AbortSignal } = {}
): Promise<T> {
  if (!BASE_URL || !TOKEN) {
    // Fail fast with clear guidance
    throw new Error(
      "ONEPTE API is not configured. Set ONEPTE_API_BASE_URL and ONEPTE_API_TOKEN in .env.local"
    );
  }

  const url = `${BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };

  const exec = async () => {
    // Basic retry with exponential backoff
    const maxRetries = 3;
    let attempt = 0;
    let lastErr: unknown;

    while (attempt < maxRetries) {
      try {
        const res = await fetch(url, {
          method: opts.method ?? "GET",
          headers,
          body: opts.body ? JSON.stringify(opts.body) : undefined,
          signal: opts.signal,
          // Ensure SSR fetch caching is caller-controlled (default no-store)
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          // Retry on 429/5xx
          if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
            throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
          }
          // Non-retryable
          throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
        }

        // try json else text
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          return (await res.json()) as T;
        }
        // Non-JSON response fallback cast
        return (await res.text()) as unknown as T;
      } catch (err: unknown) {
        lastErr = err;
        attempt++;
        if (attempt >= maxRetries) break;
        const delay = 250 * Math.pow(2, attempt - 1); // 250ms, 500ms, 1000ms
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  };

  return limiter.run(exec);
}

// External API path mapping for speaking types
// Adjust these endpoint fragments to match the real provider spec.
const SpeakingPathMap: Record<SpeakingTypeCode, string> = {
  s_read_aloud: "speaking/read-aloud",
  s_repeat_sentence: "speaking/repeat-sentence",
  s_describe_image: "speaking/describe-image",
  s_retell_lecture: "speaking/retell-lecture",
  s_short_question: "speaking/answer-short-question",
  s_respond_situation_academic: "speaking/respond-to-a-situation",
  s_summarize_group_discussion: "speaking/summarize-group-discussion",
};

// Basic normalizer to our canonical ExternalSpeakingItem shape
function normalizeSpeakingItem(raw: unknown): ExternalSpeakingItem {
  const r = raw as { [key: string]: unknown };

  const idCandidate = r["id"] ?? r["externalId"] ?? r["_id"];
  const id =
    typeof idCandidate === "string" || typeof idCandidate === "number"
      ? idCandidate
      : String(Math.random());

  const textVal =
    typeof r["text"] === "string"
      ? (r["text"] as string)
      : typeof r["content"] === "string"
      ? (r["content"] as string)
      : null;

  const title =
    typeof r["title"] === "string"
      ? (r["title"] as string)
      : typeof r["name"] === "string"
      ? (r["name"] as string)
      : textVal
      ? textVal.slice(0, 80)
      : undefined;

  const audioUrl =
    typeof r["audioUrl"] === "string"
      ? (r["audioUrl"] as string)
      : typeof r["audio"] === "string"
      ? (r["audio"] as string)
      : null;

  const imageUrl =
    typeof r["imageUrl"] === "string"
      ? (r["imageUrl"] as string)
      : typeof r["image"] === "string"
      ? (r["image"] as string)
      : null;

  const duration =
    typeof r["duration"] === "number"
      ? (r["duration"] as number)
      : typeof r["durationSec"] === "number"
      ? (r["durationSec"] as number)
      : null;

  const difficulty =
    typeof r["difficulty"] === "string" ? (r["difficulty"] as string) : null;

  const tags = Array.isArray(r["tags"]) ? (r["tags"] as string[]) : null;

  return {
    id: id as string | number,
    title,
    text: textVal ?? undefined,
    audioUrl: audioUrl ?? undefined,
    imageUrl: imageUrl ?? undefined,
    durationSec: duration ?? undefined,
    difficulty: difficulty ?? undefined,
    tags: tags ?? undefined,
    raw,
  };
}

// Fetch a page of speaking questions for a specific type
export async function fetchSpeakingPage(
  type: SpeakingTypeCode,
  page = 1,
  limit = 50
): Promise<PaginatedResponse<ExternalSpeakingItem>> {
  const path = SpeakingPathMap[type];
  if (!path) {
    throw new Error(`Unsupported speaking type: ${type}`);
  }

  // Common paging querystring; adjust keys if provider uses different names
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();
  const data: unknown = await request<unknown>(`${path}?${q}`);

  // Normalize common shapes: { data, page, limit, total } or array
  let items: unknown[] = [];
  let total = 0;
  let current = page;
  let size = limit;

  if (Array.isArray(data)) {
    items = data;
    total = data.length;
  } else if (data && typeof data === "object") {
    const obj: any = data as any;
    items = Array.isArray(obj.data)
      ? obj.data
      : Array.isArray(obj.items)
      ? obj.items
      : [];
    total =
      (typeof obj.total === "number" ? obj.total : obj.count) ?? items.length;
    current =
      (typeof obj.page === "number" ? obj.page : obj.currentPage) ?? page;
    size = (typeof obj.limit === "number" ? obj.limit : obj.pageSize) ?? limit;
  }

  return {
    data: items.map(normalizeSpeakingItem),
    page: current,
    limit: size,
    total,
  };
}

// Fetch all pages for a specific speaking type (be careful with large datasets)
export async function fetchSpeakingAll(
  type: SpeakingTypeCode,
  pageSize = 100
): Promise<ExternalSpeakingItem[]> {
  const first = await fetchSpeakingPage(type, 1, pageSize);
  const results = [...first.data];
  const pages = Math.max(1, Math.ceil(first.total / first.limit));

  for (let p = 2; p <= pages; p++) {
    const pg = await fetchSpeakingPage(type, p, pageSize);
    results.push(...pg.data);
  }
  return results;
}

// Generic POST helper if provider exposes search/filter endpoints
export async function postJson<TReq, TRes>(
  path: string,
  body: TReq
): Promise<TRes> {
  return request<TRes>(path, { method: "POST", body });
}

// Health check to validate credentials at deploy time
export async function validateExternalConnectivity(): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    // ping a lightweight endpoint if available, fallback to first type
    await fetchSpeakingPage("s_read_aloud", 1, 1);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: String((e as any)?.message ?? e) };
  }
}
