import { mockCategories as categories } from "../../categories/api/categories.mock";
import { notes } from "../../notes/api/notes.api";

export type MemoryGraphRelation = {
  id: string;
  source: string;
  target: string;
  type: "contains" | "related";
};

export function getMemoryGraphRelations(): MemoryGraphRelation[] {
  const contains = notes.flatMap((note) =>
    note.categoryIds.map((categoryId) => ({
      id: `category-${categoryId}-note-${note.id}`,
      source: `category-${categoryId}`,
      target: `note-${note.id}`,
      type: "contains" as const,
    })),
  );
  const seen = new Set<string>();
  const related = notes.flatMap((note) =>
    note.relatedIds.flatMap((targetId) => {
      const pair = [note.id, targetId].sort().join("-");
      if (seen.has(pair)) return [];
      seen.add(pair);
      return [
        {
          id: `related-${pair}`,
          source: `note-${note.id}`,
          target: `note-${targetId}`,
          type: "related" as const,
        },
      ];
    }),
  );
  return [...contains, ...related];
}

export { categories, notes };
