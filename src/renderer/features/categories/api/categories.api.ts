import type { Category } from '../types/category.types';

export const categories: Category[] = [
  { id: 'electron', name: 'Electron', description: 'Desktop app architecture and implementation', color: '#6366f1', icon: 'Code2' },
  { id: 'search', name: 'Search', description: 'Indexing, ranking and recall', color: '#0ea5e9', icon: 'Search' },
  { id: 'product', name: 'Product', description: 'Ideas, scope and product decisions', color: '#a855f7', icon: 'Lightbulb' },
  { id: 'recap', name: 'Recap', description: 'Daily reminders and review', color: '#f59e0b', icon: 'Bell' },
  { id: 'editor', name: 'Editor', description: 'Writing and content structure', color: '#10b981', icon: 'FileText' },
];

export async function getCategories() { return Promise.resolve(categories); }
export async function searchCategories(query: string) {
  await new Promise((resolve) => setTimeout(resolve, 120));
  const keyword = query.trim().toLocaleLowerCase();
  return keyword ? categories.filter((item) => `${item.name} ${item.description}`.toLocaleLowerCase().includes(keyword)) : categories;
}
