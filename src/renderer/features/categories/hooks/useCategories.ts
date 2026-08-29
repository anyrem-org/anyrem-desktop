import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/auth.store';

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  getCategoryNotes,
  updateCategory,
} from '../api/categories.api';
import type { CategoryListFilters, CategoryNoteFilters } from '../types/category.types';

export const categoryKeys = {
  all: ['categories'] as const,
  list: (filters: CategoryListFilters) => {
    return ['categories', 'list', filters] as const;
  },
  detail: (id: string) => {
    return ['categories', id] as const;
  },
  notes: (id: string, filters: CategoryNoteFilters) => {
    return ['categories', id, 'notes', filters] as const;
  },
};

export const useGetCategories = () => {
  const authenticated = useAuthStore((state) => {
    return Boolean(state.accessToken);
  });

  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => {
      return getCategories({ limit: 100 });
    },
    select: (data) => {
      return data.items;
    },
    enabled: authenticated,
    retry: 1,
  });
};

export const useGetCategoryList = (filters: CategoryListFilters) => {
  const authenticated = useAuthStore((state) => {
    return Boolean(state.accessToken);
  });

  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => {
      return getCategories(filters);
    },
    enabled: authenticated,
    retry: 1,
  });
};

export const useGetCategory = (id?: string) => {
  const authenticated = useAuthStore((state) => {
    return Boolean(state.accessToken);
  });

  return useQuery({
    queryKey: categoryKeys.detail(id ?? ''),
    queryFn: () => {
      return getCategory(id!);
    },
    enabled: authenticated && Boolean(id),
    retry: 1,
  });
};

export const useGetCategoryNotes = (id: string | undefined, filters: CategoryNoteFilters) => {
  const authenticated = useAuthStore((state) => {
    return Boolean(state.accessToken);
  });

  return useQuery({
    queryKey: categoryKeys.notes(id ?? '', filters),
    queryFn: () => {
      return getCategoryNotes({ id: id!, filters });
    },
    enabled: authenticated && Boolean(id),
    retry: 1,
  });
};

function invalidateCategoryQueries(client: ReturnType<typeof useQueryClient>) {
  client.invalidateQueries({ queryKey: categoryKeys.all });
  client.invalidateQueries({ queryKey: ['categories', 'list'] });
}

export function useCreateCategory() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      invalidateCategoryQueries(client);
    },
  });
}

export function useUpdateCategory() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (category) => {
      invalidateCategoryQueries(client);
      client.invalidateQueries({ queryKey: categoryKeys.detail(category.id) });
    },
  });
}

export function useDeleteCategory() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_data, id) => {
      client.removeQueries({ queryKey: categoryKeys.detail(id) });
      invalidateCategoryQueries(client);
    },
  });
}
