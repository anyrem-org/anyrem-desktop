import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";

type AuthStatus = "initializing" | "authenticated" | "anonymous";
type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
};

const storageKey = "anyrem.auth.session";

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as { user: AuthUser | null; accessToken: string | null };
  } catch {
    return null;
  }
}

function writeStoredSession(session: { user: AuthUser | null; accessToken: string | null } | null) {
  try {
    if (!session) window.localStorage.removeItem(storageKey);
    else window.localStorage.setItem(storageKey, JSON.stringify(session));
  } catch {
    // ponytail: localStorage persistence is best-effort; in-memory store still works.
  }
}

const stored = readStoredSession();

export const useAuthStore = create<AuthState>((set) => ({
  user: stored?.user ?? null,
  accessToken: stored?.accessToken ?? null,
  status: stored?.accessToken ? "authenticated" : "initializing",
  setSession: (user, accessToken) =>
    set(() => {
      writeStoredSession({ user, accessToken });
      return { user, accessToken, status: "authenticated" };
    }),
  setAccessToken: (accessToken) =>
    set((state) => {
      writeStoredSession({ user: state.user, accessToken });
      return {
        accessToken,
        status: accessToken ? "authenticated" : state.status,
      };
    }),
  clearSession: () =>
    set(() => {
      writeStoredSession(null);
      return { user: null, accessToken: null, status: "anonymous" };
    }),
}));
