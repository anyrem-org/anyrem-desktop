import { apiClient } from "../../../shared/lib/api-client";
import type { CategoryIcon } from "../../categories/types/category.types";
import type { Note, NoteRecord } from "../../notes/types/note.types";

type ApiNote = {
  id: string;
  title: string;
  contentText: string;
  contentHtml?: string | null;
  contentJson?: Record<string, unknown>;
  pinned: boolean;
  updatedAt: string;
  lastOpenedAt?: string | null;
  categories: Array<{ categoryId: string; category: { name: string; color: string } }>;
  relationsLeft: Array<{ rightNoteId: string }>;
  relationsRight: Array<{ leftNoteId: string }>;
};

type ApiDashboard = {
  today: ApiNote[];
  continue: ApiNote | null;
  recentlyActive: Array<{ occurredAt: string; note: ApiNote | null }>;
  topCategories: Array<{ id: string; name: string; color: string; icon?: string | null; count: number }>;
  recapPreview: { localDate: string; noteCount: number };
};

export type DashboardData = {
  today: Note[];
  continue: Note | null;
  recentlyActive: Array<Note & { occurredAt: string }>;
  topCategories: Array<{ id: string; name: string; color: string; icon: CategoryIcon; count: number }>;
  recapPreview: { localDate: string; noteCount: number };
};

const icons = new Set<CategoryIcon>(["Code2", "Search", "Lightbulb", "Bell", "FileText", "Folder"]);

const mapNote = (note: ApiNote): NoteRecord => ({
  id: note.id,
  title: note.title,
  content: note.contentText,
  contentJson: note.contentJson ?? {},
  contentHtml: note.contentHtml ?? "",
  category: note.categories[0]?.category.name ?? "Uncategorized",
  categoryColor: note.categories[0]?.category.color ?? "#64748b",
  categoryIds: note.categories.map((item) => item.categoryId),
  relatedIds: [...note.relationsLeft.map((item) => item.rightNoteId), ...note.relationsRight.map((item) => item.leftNoteId)],
  updatedAt: new Date(note.updatedAt).toLocaleString(),
  pinned: note.pinned,
});

export const getDashboard = () =>
  apiClient.get<ApiDashboard>("/dashboard").then(({ data }): DashboardData => ({
    today: data.today.map(mapNote),
    continue: data.continue ? mapNote(data.continue) : null,
    recentlyActive: data.recentlyActive
      .filter((item): item is { occurredAt: string; note: ApiNote } => Boolean(item.note))
      .map((item) => ({ ...mapNote(item.note), occurredAt: new Date(item.occurredAt).toLocaleString() })),
    topCategories: data.topCategories.map((item) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      icon: icons.has(item.icon as CategoryIcon) ? (item.icon as CategoryIcon) : "Folder",
      count: item.count,
    })),
    recapPreview: data.recapPreview,
  }));
