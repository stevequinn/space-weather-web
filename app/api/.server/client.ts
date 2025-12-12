// app/api.server/client.ts
import { ApiError } from "./errors";

export type ApiClientOptions = {
  baseUrl: string; // e.g. "https://api.example.com"
  getAuthToken?: () => string | null;
  defaultHeaders?: Record<string, string>;
  fetchImpl?: typeof fetch;
};

export type RequestOptions = {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
};

function joinUrl(baseUrl: string, path: string) {
  const b = baseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function withQuery(url: string, query?: RequestOptions["query"]) {
  if (!query) return url;
  const u = new URL(url);

  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

async function readJsonOrText(res: Response): Promise<unknown> {
  // Handle empty responses safely
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!text) return null;

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      // If server lied about content-type or returned invalid JSON
      return text;
    }
  }

  return text;
}

export function createApiClient(opts: ApiClientOptions) {
  const fetcher = opts.fetchImpl ?? fetch;

  async function get<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = withQuery(joinUrl(opts.baseUrl, path), options.query);

    const headers: Record<string, string> = {
      accept: "application/json",
      ...(opts.defaultHeaders ?? {}),
      ...(options.headers ?? {}),
    };

    const token = opts.getAuthToken?.();
    if (token) headers.authorization = `Bearer ${token}`;

    const res = await fetcher(url, {
      method: "GET",
      headers,
      signal: options.signal,
    });

    const body = await readJsonOrText(res);

    if (!res.ok) {
      throw new ApiError({
        message: `Request failed: ${res.status} ${res.statusText}`,
        status: res.status,
        url,
        body,
      });
    }

    return body as T;
  }

  return { get };
}
