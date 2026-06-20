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
