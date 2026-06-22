export type CategoryIcon = "Code2" | "Search" | "Lightbulb" | "Bell" | "FileText" | "Folder";
export type Category = { id: string; name: string; description: string; color: string; icon: CategoryIcon; noteCount: number };
export type CategoryNoteSummary = { id: string; title: string; contentText: string; pinned: boolean; updatedAt: string };
export type CategoryDetail = Category;
export type CategoryNoteFilters = { page: number; limit?: number; q?: string; pinned?: boolean; from?: string; to?: string; sort?: "updated_desc" | "created_desc" | "title_asc" };
export type CreateCategoryInput = { name: string; description?: string; color: string; icon?: CategoryIcon };
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
