export type Note = {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  categoryIds: string[];
  content: string;
  relatedIds: string[];
  updatedAt: string;
  pinned?: boolean;
};

export type NoteRecord = Note & {
  contentJson: Record<string, unknown>;
  contentHtml: string;
};

export type NoteInput = {
  title: string;
  contentJson: Record<string, unknown>;
  categoryIds: string[];
  relatedIds: string[];
  pinned?: boolean;
};

export type NoteFilters = {
  page: number;
  limit?: number;
  q?: string;
  categoryId?: string;
};
