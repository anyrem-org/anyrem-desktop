import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../auth/store/auth.store";
import { searchNotes, type SearchNoteFilters } from "../api/search.api";

export const useSearchNotes = (filters: SearchNoteFilters) => {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  return useQuery({ queryKey: ["search", "notes", filters], queryFn: () => searchNotes(filters), enabled: authenticated, retry: 1 });
};
