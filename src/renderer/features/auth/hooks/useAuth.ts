import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import {
  exchangeGoogleCode,
  forgotPassword,
  login,
  logout,
  register,
  resendVerification,
  restoreSession,
} from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

const sessionKey = ["auth", "session"] as const;

export function useSessionBootstrap() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const query = useQuery({ queryKey: sessionKey, queryFn: restoreSession, retry: false, staleTime: Infinity });
  useEffect(() => {
    if (query.data) setSession(query.data.user, query.data.accessToken);
    else if (query.isSuccess || query.isError) clearSession();
  }, [clearSession, query.data, query.isError, query.isSuccess, setSession]);
  return query;
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: login, onSuccess: (session) => { setSession(session.user, session.accessToken); queryClient.setQueryData(sessionKey, session); } });
}

export function useRegister() {
  return useMutation({ mutationFn: register });
}

export function useResendVerification() {
  return useMutation({ mutationFn: resendVerification });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword });
}

export function useGoogleLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: exchangeGoogleCode,
    onSuccess: (session) => {
      setSession(session.user, session.accessToken);
      queryClient.setQueryData(sessionKey, session);
    },
  });
}

export function useGoogleAuthListener() {
  const navigate = useNavigate();
  const googleLogin = useGoogleLogin();
  useEffect(() => {
    return window.desktop?.onGoogleAuth((code) => {
      googleLogin.mutate(code, {
        onSuccess: () => navigate("/", { replace: true }),
        onError: (error) =>
          navigate("/login", {
            replace: true,
            state: { authError: getApiErrorMessage(error) },
          }),
      });
    });
  }, [googleLogin, navigate]);
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: logout, onSettled: () => { clearSession(); queryClient.clear(); } });
}
