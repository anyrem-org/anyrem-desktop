import type { Category } from "../types/category.types";

export const mockCategories: Category[] = [
  { id: "electron", name: "Electron", description: "Desktop app architecture and implementation", color: "#6366f1", icon: "Code2", noteCount: 2 },
  { id: "search", name: "Search", description: "Indexing, ranking and recall", color: "#0ea5e9", icon: "Search", noteCount: 1 },
  { id: "product", name: "Product", description: "Ideas, scope and product decisions", color: "#a855f7", icon: "Lightbulb", noteCount: 2 },
  { id: "recap", name: "Recap", description: "Daily reminders and review", color: "#f59e0b", icon: "Bell", noteCount: 1 },
  { id: "editor", name: "Editor", description: "Writing and content structure", color: "#10b981", icon: "FileText", noteCount: 1 },
];
