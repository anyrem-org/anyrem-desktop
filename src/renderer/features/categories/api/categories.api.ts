import { apiClient } from "../../../shared/lib/api-client";
import type { Paginated } from "../../../shared/types/api.types";
import { categoryIconNames, type Category, type CategoryDetail, type CategoryIcon, type CategoryNoteFilters, type CategoryNoteSummary, type CreateCategoryInput, type UpdateCategoryInput } from "../types/category.types";

const icons = new Set<CategoryIcon>(categoryIconNames);
type ApiCategory = { id: string; name: string; description: string | null; color: string; icon: string | null; _count?: { notes: number } };
const mapCategory = (item: ApiCategory): Category => ({ id: item.id, name: item.name, description: item.description ?? "", color: item.color, icon: icons.has(item.icon as CategoryIcon) ? item.icon as CategoryIcon : "Folder", noteCount: item._count?.notes ?? 0 });

export const getCategories = () => apiClient.get<ApiCategory[]>("/categories").then(({ data }) => data.map(mapCategory));
export const getCategory = (id: string) => apiClient.get<ApiCategory>(`/categories/${id}`).then(({ data }) => mapCategory(data) satisfies CategoryDetail);
export const getCategoryNotes = ({ id, filters }: { id: string; filters: CategoryNoteFilters }) => apiClient.get<Paginated<CategoryNoteSummary>>(`/categories/${id}/notes`, { params: filters }).then(({ data }) => data);
export const createCategory = (input: CreateCategoryInput) => apiClient.post<ApiCategory>("/categories", input).then(({ data }) => mapCategory(data));
export const updateCategory = ({ id, input }: { id: string; input: UpdateCategoryInput }) => apiClient.patch<ApiCategory>(`/categories/${id}`, input).then(({ data }) => mapCategory(data));
export const deleteCategory = (id: string) => apiClient.delete<{ deleted: true }>(`/categories/${id}`).then(({ data }) => data);
