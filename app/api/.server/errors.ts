// app/api.server/errors.ts
import type { HTTPValidationError } from "../types";

export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body: unknown;

  constructor(args: {
    message: string;
    status: number;
    url: string;
    body: unknown;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.url = args.url;
    this.body = args.body;
  }
}

export function isHTTPValidationError(x: unknown): x is HTTPValidationError {
  if (!x || typeof x !== "object") return false;
  const v = x as { detail?: unknown };
  return v.detail === undefined || Array.isArray(v.detail);
}
