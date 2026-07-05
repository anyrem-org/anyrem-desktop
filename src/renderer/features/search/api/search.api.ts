import { apiClient } from "../../../shared/lib/api-client";
import type { Paginated } from "../../../shared/types/api.types";
import type { Note } from "../../notes/types/note.types";

export type SearchHistoryItem = {
  id: string;
  keyword: string;
  searchCount: number;
  lastSearchedAt: string;
};

export type SearchNoteFilters = {
  q: string;
  page: number;
  limit?: number;
  categoryId?: string;
  pinned?: boolean;
  from?: string;
  to?: string;
  sort?: "relevance" | "recent";
};

type SearchHit = {
  id: string;
  title: string;
  contentText: string;
  categoryIds: string[];
  categoryNames: string[];
  pinned: boolean;
  updatedAt: number;
};

export const searchNotes = (filters: SearchNoteFilters) =>
  apiClient.get<Paginated<SearchHit>>("/search/notes", { params: filters }).then(({ data }) => ({
    ...data,
    totalPages: Math.ceil(data.total / data.limit),
    items: data.items.map((note): Note => ({
      id: note.id,
      title: note.title,
      category: note.categoryNames[0] ?? "Uncategorized",
      categoryColor: "#64748b",
      categoryIds: note.categoryIds,
      content: note.contentText,
      relatedIds: [],
      updatedAt: new Date(note.updatedAt * 1000).toLocaleString(),
      pinned: note.pinned,
    })),
  }));

export const getSearchHistory = () =>
  apiClient.get<SearchHistoryItem[]>("/search/history").then(({ data }) => data);

export const clearSearchHistory = () =>
  apiClient.delete<{ deleted: true }>("/search/history").then(({ data }) => data);
