import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../auth/store/auth.store";
import { getDashboard } from "../api/dashboard.api";

export const useDashboard = () => {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  return useQuery({ queryKey: ["dashboard"], queryFn: getDashboard, enabled: authenticated, retry: 1 });
};
