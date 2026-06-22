import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../src/renderer/features/auth/store/auth.store";
import { apiClient, authClient } from "../src/renderer/shared/lib/api-client";

const response = (config: InternalAxiosRequestConfig, status = 200) => ({ data: { ok: true }, status, statusText: status === 200 ? "OK" : "Unauthorized", headers: new AxiosHeaders(), config });
const unauthorized = (config: InternalAxiosRequestConfig) => new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, response(config, 401));

describe("Axios auth interceptors", () => {
  const getRefreshToken = vi.fn(async () => "refresh-token");
  const clearRefreshToken = vi.fn(async () => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
    useAuthStore.getState().setAccessToken("old-token");
    Object.assign(globalThis, { window: { desktop: { getRefreshToken, clearRefreshToken } } });
  });

  it("coalesces concurrent refresh and retries with the new Bearer token", async () => {
    let refreshCalls = 0;
    authClient.defaults.adapter = async (config) => { refreshCalls++; await new Promise((resolve) => setTimeout(resolve, 5)); return { ...response(config), data: { accessToken: "new-token" } }; };
    apiClient.defaults.adapter = async (config) => {
      if (config.headers.Authorization !== "Bearer new-token") throw unauthorized(config);
      return response(config);
    };

    await Promise.all([apiClient.get("/categories"), apiClient.get("/categories")]);

    expect(refreshCalls).toBe(1);
    expect(getRefreshToken).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe("new-token");
  });

  it("clears session when refresh fails", async () => {
    authClient.defaults.adapter = async (config) => { throw unauthorized(config); };
    apiClient.defaults.adapter = async (config) => { throw unauthorized(config); };

    await expect(apiClient.get("/categories")).rejects.toBeInstanceOf(AxiosError);

    expect(clearRefreshToken).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().status).toBe("anonymous");
  });
});
