import { apiClient } from "../../../shared/lib/api-client";

export type GraphCategory = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string | null;
  noteCount: number;
};

export type GraphNote = {
  id: string;
  title: string;
  content: string;
  contentHtml?: string;
  category: string;
  categoryColor: string;
  categoryIds: string[];
  relatedIds: string[];
  updatedAt: string;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: "contains" | "related";
};

export type MemoryGraph = {
  categories: GraphCategory[];
  notes: GraphNote[];
  edges: GraphEdge[];
};

export const getMemoryGraph = () =>
  apiClient.get<MemoryGraph>("/graph").then(({ data }) => data);
