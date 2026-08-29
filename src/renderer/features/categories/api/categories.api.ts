import { apiClient } from '../../../shared/lib/api-client';
import type { Paginated } from '../../../shared/types/api.types';
import {
  categoryIconNames,
  type Category,
  type CategoryDetail,
  type CategoryIcon,
  type CategoryListFilters,
  type CategoryNoteFilters,
  type CategoryNoteSummary,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '../types/category.types';

const icons = new Set<CategoryIcon>(categoryIconNames);

type ApiCategory = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { notes: number };
};

function mapCategory(item: ApiCategory): Category {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    color: item.color,
    icon: icons.has(item.icon as CategoryIcon) ? (item.icon as CategoryIcon) : 'Folder',
    noteCount: item._count?.notes ?? 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function getCategories(filters: CategoryListFilters = {}) {
  const { data } = await apiClient.get<Paginated<ApiCategory>>('/categories', { params: filters });
  return { ...data, items: data.items.map(mapCategory) };
}

export async function getCategory(id: string) {
  const { data } = await apiClient.get<ApiCategory>(`/categories/${id}`);
  return mapCategory(data) satisfies CategoryDetail;
}

export async function getCategoryNotes({
  id,
  filters,
}: {
  id: string;
  filters: CategoryNoteFilters;
}) {
  const { data } = await apiClient.get<Paginated<CategoryNoteSummary>>(`/categories/${id}/notes`, {
    params: filters,
  });
  return data;
}

export async function createCategory(input: CreateCategoryInput) {
  const { data } = await apiClient.post<ApiCategory>('/categories', input);
  return mapCategory(data);
}

export async function updateCategory({ id, input }: { id: string; input: UpdateCategoryInput }) {
  const { data } = await apiClient.patch<ApiCategory>(`/categories/${id}`, input);
  return mapCategory(data);
}

export async function deleteCategory(id: string) {
  const { data } = await apiClient.delete<{ deleted: true }>(`/categories/${id}`);
  return data;
}
