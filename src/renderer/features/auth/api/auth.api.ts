import { authClient } from "../../../shared/lib/api-client";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  TokenResponse,
} from "../types/auth.types";

const getMe = (accessToken: string) => authClient.get<AuthUser>("/users/me", { headers: { Authorization: `Bearer ${accessToken}` } }).then((response) => response.data);

async function completeAuth(tokens: TokenResponse) {
  const user = await getMe(tokens.accessToken);
  await window.desktop?.setRefreshToken(tokens.refreshToken);
  return { user, accessToken: tokens.accessToken };
}

export async function login(input: LoginInput) {
  const { data: tokens } = await authClient.post<TokenResponse>("/auth/login", input);
  return completeAuth(tokens);
}

export const register = (input: RegisterInput) =>
  authClient
    .post<{ id: string; email: string; verificationRequired: boolean }>(
      "/auth/register",
      input,
    )
    .then(({ data }) => data);

export const resendVerification = (email: string) =>
  authClient
    .post<{ accepted: true }>("/auth/resend-verification", { email })
    .then(({ data }) => data);

export const forgotPassword = (email: string) =>
  authClient
    .post<{ accepted: true }>("/auth/forgot-password", { email })
    .then(({ data }) => data);

export async function exchangeGoogleCode(code: string) {
  const { data: tokens } = await authClient.post<TokenResponse>("/auth/google/exchange", {
    code,
    deviceName: "AnyRem Desktop",
  });
  return completeAuth(tokens);
}

export const googleAuthUrl = () =>
  `${import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"}/auth/google`;

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
