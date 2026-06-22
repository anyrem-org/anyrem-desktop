import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { login, logout, restoreSession } from "../api/auth.api";
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

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: logout, onSettled: () => { clearSession(); queryClient.clear(); } });
}
