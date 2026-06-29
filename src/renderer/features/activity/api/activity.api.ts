import { apiClient } from "../../../shared/lib/api-client";
import type { NoteRecord } from "../../notes/types/note.types";

type ApiActivityType = "CREATED" | "VIEWED" | "EDITED" | "PINNED" | "UNPINNED";

type ApiActivityNote = {
  id: string;
  title: string;
  contentJson: Record<string, unknown>;
  contentText: string;
  contentHtml: string | null;
  pinned: boolean;
  updatedAt: string;
  categories: Array<{
    categoryId: string;
    category: { name: string; color: string };
  }>;
  relationsLeft: Array<{ rightNoteId: string }>;
  relationsRight: Array<{ leftNoteId: string }>;
};

type ApiActivityResponse = {
  todayCount: number;
  items: Array<{
    id: string;
    type: ApiActivityType;
    occurredAt: string;
    note: ApiActivityNote;
  }>;
};

export type ActivityItem = {
  id: string;
  type: ApiActivityType;
  label: string;
  occurredAt: string;
  note: NoteRecord;
};

const labels: Record<ApiActivityType, string> = {
  CREATED: "Created",
  VIEWED: "Viewed",
  EDITED: "Edited",
  PINNED: "Pinned",
  UNPINNED: "Unpinned",
};

const mapNote = (note: ApiActivityNote): NoteRecord => ({
  id: note.id,
  title: note.title,
  content: note.contentText,
  contentJson: note.contentJson,
  contentHtml: note.contentHtml ?? "",
  category: note.categories[0]?.category.name ?? "Uncategorized",
  categoryColor: note.categories[0]?.category.color ?? "#64748b",
  categoryIds: note.categories.map((item) => item.categoryId),
  relatedIds: [
    ...note.relationsLeft.map((item) => item.rightNoteId),
    ...note.relationsRight.map((item) => item.leftNoteId),
  ],
  updatedAt: new Date(note.updatedAt).toLocaleString(),
  pinned: note.pinned,
});

export const getRecentActivity = () =>
  apiClient.get<ApiActivityResponse>("/activity/recent").then(({ data }) => ({
    todayCount: data.todayCount,
    items: data.items.map((item) => ({
      id: item.id,
      type: item.type,
      label: labels[item.type],
      occurredAt: new Date(item.occurredAt).toLocaleString(),
      note: mapNote(item.note),
    })),
  }));
