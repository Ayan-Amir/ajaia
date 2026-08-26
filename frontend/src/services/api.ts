import axios from "axios";
import { env } from "@/config/env";
import { MESSAGES } from "@/constants/messages";

export const TOKEN_STORAGE_KEY = "ajaia.token";

export const api = axios.create({ baseURL: `${env.apiUrl}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A stale token should not leave the app rendering a half-logged-in shell.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    return Promise.reject(error);
  },
);

/** Pull the most useful message out of a DRF error body. */
export function toErrorMessage(error: unknown, fallback: string = MESSAGES.genericError): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const detail = (data as Record<string, unknown>).detail;
    if (typeof detail === "string") return detail;

    const firstValue = Object.values(data)[0];
    if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
      return firstValue[0];
    }
  }
  return fallback;
}
