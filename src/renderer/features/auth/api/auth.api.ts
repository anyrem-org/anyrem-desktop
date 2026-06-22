import { authClient } from "../../../shared/lib/api-client";
import type { AuthUser, LoginInput, TokenResponse } from "../types/auth.types";

const getMe = (accessToken: string) => authClient.get<AuthUser>("/users/me", { headers: { Authorization: `Bearer ${accessToken}` } }).then((response) => response.data);

export async function login(input: LoginInput) {
  const { data: tokens } = await authClient.post<TokenResponse>("/auth/login", input);
  const user = await getMe(tokens.accessToken);
  await window.desktop?.setRefreshToken(tokens.refreshToken);
  return { user, accessToken: tokens.accessToken };
}

export async function restoreSession() {
  const refreshToken = await window.desktop?.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await authClient.post<Pick<TokenResponse, "accessToken" | "expiresIn">>("/auth/refresh", { refreshToken });
    return { user: await getMe(data.accessToken), accessToken: data.accessToken };
  } catch (error) {
    await window.desktop?.clearRefreshToken();
    throw error;
  }
}

export async function logout() {
  const refreshToken = await window.desktop?.getRefreshToken();
  try {
    if (refreshToken) await authClient.post("/auth/logout", { refreshToken });
  } finally {
    await window.desktop?.clearRefreshToken();
  }
}
