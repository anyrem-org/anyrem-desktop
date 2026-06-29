import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../auth/store/auth.store";
import {
  clearSearchHistory,
  getSearchHistory,
  searchNotes,
  type SearchNoteFilters,
} from "../api/search.api";

const searchHistoryKey = ["search", "history"] as const;

export const useSearchNotes = (filters: SearchNoteFilters) => {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  return useQuery({ queryKey: ["search", "notes", filters], queryFn: () => searchNotes(filters), enabled: authenticated, retry: 1 });
};

export const useSearchHistory = (enabled: boolean) => {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  return useQuery({
    queryKey: searchHistoryKey,
    queryFn: getSearchHistory,
    enabled: authenticated && enabled,
    staleTime: 60_000,
    retry: 1,
  });
};

export function useClearSearchHistory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: clearSearchHistory,
    onSuccess: () => client.setQueryData(searchHistoryKey, []),
  });
}
