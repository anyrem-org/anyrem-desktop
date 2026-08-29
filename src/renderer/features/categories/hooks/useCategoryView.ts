import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/auth.store';
import {
  getCategoryView,
  updateCategoryView,
  type CategoryView,
  type CategoryViewScope,
} from '../api/category-view.api';

function categoryViewKey(userId: string, scope: CategoryViewScope) {
  return ['categories', 'view', scope, userId] as const;
}

export function useCategoryView(scope: CategoryViewScope = 'categories') {
  const userId = useAuthStore((state) => {
    return state.user?.id;
  });

  return useQuery({
    queryKey: categoryViewKey(userId ?? '', scope),
    queryFn: () => {
      return getCategoryView(scope);
    },
    enabled: Boolean(userId),
    initialData: 'card' as CategoryView,
  });
}

export function useUpdateCategoryView(scope: CategoryViewScope = 'categories') {
  const userId = useAuthStore((state) => {
    return state.user?.id;
  });
  const client = useQueryClient();

  return useMutation({
    mutationFn: (view: CategoryView) => {
      return updateCategoryView({ scope, view });
    },
    onSuccess: (view) => {
      if (userId) {
        client.setQueryData(categoryViewKey(userId, scope), view);
      }
    },
  });
}
