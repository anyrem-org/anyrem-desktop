import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../../features/auth/store/auth.store";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const authClient = axios.create({ baseURL, timeout: 15_000 });
export const apiClient = axios.create({ baseURL, timeout: 15_000 });

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = await window.desktop?.getRefreshToken();
    if (!refreshToken) throw new Error("Missing refresh token");
    const { data } = await authClient.post<{ accessToken: string }>("/auth/refresh", { refreshToken });
    useAuthStore.getState().setAccessToken(data.accessToken);
    return data.accessToken;
  })();
  try {
    return await refreshPromise;
  } catch (error) {
    await window.desktop?.clearRefreshToken();
    useAuthStore.getState().clearSession();
    throw error;
  } finally {
    refreshPromise = null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const isAuthRequest = config?.url?.includes("/auth/login") || config?.url?.includes("/auth/refresh");
    if (error.response?.status !== 401 || !config || config._retry || isAuthRequest) throw error;
    config._retry = true;
    const token = await refreshAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    return apiClient(config);
  },
);

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : "Unexpected error";
  const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
  const text = Array.isArray(message) ? message.join(", ") : (message ?? error.message);
  const firstLine = text.split("\n").find(Boolean)?.trim() ?? "Unexpected error";
  if (firstLine.includes("Invalid `") || firstLine.includes("PrismaClientValidationError")) return "Could not save memory. Please try again.";
  return firstLine;
}
