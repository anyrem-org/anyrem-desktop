import { getSettings, updateSettings } from '../../settings/api/settings.api';

export type CategoryView = 'card' | 'list';
export type CategoryViewScope = 'categories' | 'detail';

function settingsKey(scope: CategoryViewScope) {
  return scope === 'categories' ? 'overview_view' : 'detail_view';
}

export async function getCategoryView(scope: CategoryViewScope): Promise<CategoryView> {
  const settings = await getSettings();
  return settings.categories[settingsKey(scope)];
}

export async function updateCategoryView({
  scope,
  view,
}: {
  scope: CategoryViewScope;
  view: CategoryView;
}): Promise<CategoryView> {
  const settings = await updateSettings([
    { type: 'categories', key: settingsKey(scope), value: view },
  ]);
  return settings.categories[settingsKey(scope)];
}
