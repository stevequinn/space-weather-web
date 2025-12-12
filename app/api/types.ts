// app/api.server/types.ts

/** Mirrors components.schemas.ValidationError */
export type ValidationError = {
  loc: Array<string | number>;
  msg: string;
  type: string;
};

/** Mirrors components.schemas.HTTPValidationError */
export type HTTPValidationError = {
  detail?: ValidationError[];
};

/** Mirrors components.schemas.KIndexData */
export type KIndexData = {
  value: number; // OpenAPI says integer
  threshold_met: boolean;
  timestamp?: string | null;
  analysis_time?: string | null;
  error?: string | null;
};

/** Mirrors components.schemas.AuroraEvent */
export type AuroraEvent = {
  k_aus?: number | null; // OpenAPI says integer|null
  lat_band?: string | null;
  description?: string | null;
  valid_until?: string | null;
  cause?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  issue_time?: string | null;
};

/** Mirrors components.schemas.AuroraCheckResponse */
export type AuroraCheckResponse = {
  summary: string;
  active: boolean;
  k_index: KIndexData;
  alert?: AuroraEvent | null;
  watch?: AuroraEvent | null;
  outlook?: AuroraEvent | null;
};
