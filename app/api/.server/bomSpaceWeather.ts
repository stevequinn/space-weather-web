// app/api.server/bomSpaceWeather.ts
import { createApiClient } from "./client";
import type { AuroraCheckResponse } from "../types";

export type BomSpaceWeatherApi = ReturnType<typeof createBomSpaceWeatherApi>;

export function createBomSpaceWeatherApi(args: {
  baseUrl: string;
  getAuthToken?: () => string | null;
}) {
  const client = createApiClient({
    baseUrl: args.baseUrl,
    getAuthToken: args.getAuthToken,
  });

  return {
    /**
     * GET /check-aurora-storm
     * Query: send_telegram_alert?: boolean (default false)
     * 200: AuroraCheckResponse
     * 422: HTTPValidationError (thrown as ApiError by client)
     */
    checkAuroraStorm: (params?: {
      sendTelegramAlert?: boolean;
      signal?: AbortSignal;
    }) => {
      return client.get<AuroraCheckResponse>("/check-aurora-storm", {
        signal: params?.signal,
        query: {
          send_telegram_alert: params?.sendTelegramAlert ?? false,
        },
      });
    },

    /**
     * GET /health
     * 200: {} (spec has an empty schema, so keep it loose)
     */
    health: (params?: { signal?: AbortSignal }) => {
      return client.get<Record<string, unknown>>("/health", {
        signal: params?.signal,
      });
    },
  };
}
