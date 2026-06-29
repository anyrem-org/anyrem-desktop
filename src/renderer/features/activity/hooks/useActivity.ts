import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../auth/store/auth.store";
import { getRecentActivity } from "../api/activity.api";

export const useRecentActivity = (enabled: boolean) => {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  return useQuery({
    queryKey: ["activity", "recent"],
    queryFn: getRecentActivity,
    enabled: authenticated && enabled,
    retry: 1,
  });
};
