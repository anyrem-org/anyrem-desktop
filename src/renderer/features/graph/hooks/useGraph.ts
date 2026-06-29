import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../auth/store/auth.store";
import { getMemoryGraph } from "../api/graph.api";

export const graphKeys = { detail: ["graph"] as const };

export const useGetGraph = () => {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  return useQuery({
    queryKey: graphKeys.detail,
    queryFn: getMemoryGraph,
    enabled: authenticated,
    retry: 1,
  });
};
