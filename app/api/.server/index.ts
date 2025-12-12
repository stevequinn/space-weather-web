// src/api.server/index.ts
import { API_BASE_URL } from "./config";
import { createBomSpaceWeatherApi } from "./bomSpaceWeather";

export const bomApi = createBomSpaceWeatherApi({
  baseUrl: API_BASE_URL,
  // getAuthToken: () => import.meta.env.VITE_API_AUTH_TOKEN || null,
});
