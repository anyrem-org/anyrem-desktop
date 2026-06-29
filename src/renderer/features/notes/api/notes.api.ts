import { apiClient } from "../../../shared/lib/api-client";
import type { Paginated } from "../../../shared/types/api.types";
import type { Note, NoteFilters, NoteInput, NoteRecord } from "../types/note.types";

export const notes: Note[] = [
  {
    id: "1",
    title: "Cơ chế sync offline-first cho Electron",
    category: "Electron",
    categoryColor: "#6366f1",
    categoryIds: ["electron", "product"],
    relatedIds: ["2", "3"],
    updatedAt: "12 phút trước",
    pinned: true,
    content:
      "Lưu thay đổi vào local store trước, đưa operation vào sync queue, sau đó đẩy lên server khi có mạng. Mỗi operation cần idempotency key để tránh ghi trùng.",
  },
  {
    id: "2",
    title: "Meilisearch và tìm kiếm tiếng Việt",
    category: "Search",
    categoryColor: "#0ea5e9",
    categoryIds: ["search"],
    relatedIds: ["1"],
    updatedAt: "1 giờ trước",
    content:
      "Tạo thêm normalized fields để tìm không dấu. Ranking ưu tiên title, category rồi mới đến content.",
  },
  {
    id: "3",
    title: "Remember Anything — MVP scope",
    category: "Product",
    categoryColor: "#a855f7",
    categoryIds: ["product"],
    relatedIds: ["1", "4"],
    updatedAt: "Hôm qua",
    content:
      "MVP tập trung quick note, tìm kiếm nhanh, related content cơ bản và daily recap. Graph, AI và offline sync để phase sau.",
  },
  {
    id: "4",
    title: "Daily recap message format",
    category: "Recap",
    categoryColor: "#f59e0b",
    categoryIds: ["recap", "product"],
    relatedIds: ["3"],
    updatedAt: "2 ngày trước",
    content:
      "Group note theo category và liệt kê title. Bản đầu chưa cần AI summary; nội dung ngắn, dễ scan cuối ngày.",
  },
  {
    id: "5",
    title: "Tiptap document storage strategy",
    category: "Editor",
    categoryColor: "#10b981",
    categoryIds: ["editor", "electron"],
    relatedIds: ["1"],
    updatedAt: "3 ngày trước",
    content:
      "Lưu content_json làm source of truth, content_text cho search và content_html chỉ dùng preview hoặc export.",
  },
];

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
