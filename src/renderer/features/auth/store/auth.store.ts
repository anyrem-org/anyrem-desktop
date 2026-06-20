import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types/auth.types";

type AuthState = {
  user: AuthUser | null;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      // ponytail: mock session; replace actions with backend/OAuth calls when auth phase starts.
      loginWithGoogle: () =>
        set({
          user: {
            id: "google-demo",
            name: "Anh Nguyen",
            email: "anh.nguyen@gmail.com",
          },
        }),
      loginWithEmail: (email) =>
        set({
          user: {
            id: "email-demo",
            name: email.split("@")[0] || "User",
            email,
          },
        }),
      logout: () => set({ user: null }),
    }),
    { name: "remember-anything-auth" },
  ),
);
