export type CategoryView = 'card' | 'list';
export type CategoryViewScope = 'categories' | 'detail';

function storageKey(userId: string, scope: CategoryViewScope) {
  return `anyrem.categories.${scope}.view.${userId}`;
}

export const getCategoryView = async (
  userId: string,
  scope: CategoryViewScope,
): Promise<CategoryView> => {
  try {
    return window.localStorage.getItem(storageKey(userId, scope)) === 'list' ? 'list' : 'card';
  } catch {
    return 'card';
  }
};

export const updateCategoryView = async ({
  userId,
  scope,
  view,
}: {
  userId: string;
  scope: CategoryViewScope;
  view: CategoryView;
}): Promise<CategoryView> => {
  try {
    window.localStorage.setItem(storageKey(userId, scope), view);
  } catch {
    // ponytail: localStorage is temporary mock persistence; replace with settings API when available.
  }
  return view;
};
