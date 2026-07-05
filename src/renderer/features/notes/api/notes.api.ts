import { apiClient } from "../../../shared/lib/api-client";
import type { Paginated } from "../../../shared/types/api.types";
import type { NoteFilters, NoteInput, NoteRecord } from "../types/note.types";

type ApiNote = {
  id: string;
  title: string;
  contentJson: Record<string, unknown>;
  contentText: string;
  contentHtml: string;
  pinned: boolean;
  updatedAt: string;
  categories: Array<{ categoryId: string; category: { name: string; color: string } }>;
  relationsLeft: Array<{ rightNoteId: string }>;
  relationsRight: Array<{ leftNoteId: string }>;
};

const mapNote = (note: ApiNote): NoteRecord => ({
  id: note.id,
  title: note.title,
  content: note.contentText,
  contentJson: note.contentJson,
  contentHtml: note.contentHtml,
  category: note.categories[0]?.category.name ?? "Uncategorized",
  categoryColor: note.categories[0]?.category.color ?? "#64748b",
  categoryIds: note.categories.map((item) => item.categoryId),
  relatedIds: [...note.relationsLeft.map((item) => item.rightNoteId), ...note.relationsRight.map((item) => item.leftNoteId)],
  updatedAt: note.updatedAt,
  pinned: note.pinned,
});

export const getNotes = (filters: NoteFilters) => apiClient.get<Paginated<ApiNote>>("/notes", { params: filters }).then(({ data }) => ({ ...data, items: data.items.map(mapNote) }));
export const getNote = (id: string) => apiClient.get<ApiNote>(`/notes/${id}`).then(({ data }) => mapNote(data));
export const createNote = (input: NoteInput) => apiClient.post<ApiNote>("/notes", input).then(({ data }) => mapNote(data));
export const updateNote = ({ id, input }: { id: string; input: NoteInput }) => apiClient.patch<ApiNote>(`/notes/${id}`, input).then(({ data }) => mapNote(data));
export const pinNote = ({ id, pinned }: { id: string; pinned: boolean }) => apiClient.patch<{ pinned: boolean }>(`/notes/${id}/pin`, { pinned }).then(({ data }) => data);
