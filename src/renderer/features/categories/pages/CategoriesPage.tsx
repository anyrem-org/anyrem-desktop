import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { Button } from '../../../shared/components/ui/button';
import { getApiErrorMessage } from '../../../shared/lib/api-client';
import { type CategoryView } from '../api/category-view.api';
import { CategoryCardGrid } from '../components/CategoryCardGrid';
import { CategoryFormDialog } from '../components/CategoryFormDialog';
import { CategoryList } from '../components/CategoryList';
import { CategoryViewToolbar } from '../components/CategoryViewToolbar';
import { useDeleteCategory, useGetCategories } from '../hooks/useCategories';
import { useCategoryView, useUpdateCategoryView } from '../hooks/useCategoryView';
import type { CategorySort } from '../types/category.types';

export function CategoriesPage() {
  const categories = useGetCategories();
  const categoryView = useCategoryView();
  const updateCategoryView = useUpdateCategoryView();
  const remove = useDeleteCategory();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<CategorySort>('updated_desc');

  const view = categoryView.data ?? 'card';
  const filteredCategories = useMemo(() => {
    if (!categories.data) {
      return [];
    }

    const normalizedQuery = query.trim().toLocaleLowerCase();
    const descending = sort.endsWith('_desc');

    return categories.data
      .filter((category) => {
        return (
          !normalizedQuery ||
          `${category.name} ${category.description}`.toLocaleLowerCase().includes(normalizedQuery)
        );
      })
      .slice()
      .sort((a, b) => {
        const values = sort.startsWith('note_count')
          ? [a.noteCount, b.noteCount]
          : [new Date(a.updatedAt).getTime(), new Date(b.updatedAt).getTime()];
        return descending ? values[1] - values[0] : values[0] - values[1];
      });
  }, [categories.data, query, sort]);

  function setView(value: CategoryView) {
    updateCategoryView.mutate(value);
  }

  if (categories.isPending) {
    return <div className="p-8 text-sm text-muted-foreground">Loading categories…</div>;
  }

  if (categories.isError) {
    return (
      <div className="p-8">
        <ErrorMessage message={getApiErrorMessage(categories.error)} className="mb-4" />
        <Button
          variant="outline"
          onClick={() => {
            categories.refetch();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="mb-1 text-2xl">Categories</h2>
          <p className="m-0 text-sm text-muted-foreground">Browse memories by context.</p>
        </div>
        <CategoryFormDialog
          trigger={
            <Button>
              <Plus size={16} /> New category
            </Button>
          }
        />
      </div>
      {remove.isError && (
        <ErrorMessage message={getApiErrorMessage(remove.error)} className="mt-5" />
      )}
      {updateCategoryView.isError && (
        <ErrorMessage message={getApiErrorMessage(updateCategoryView.error)} className="mt-5" />
      )}
      {!categories.data.length ? (
        <div className="mt-7 rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No categories yet.
        </div>
      ) : (
        <>
          <CategoryViewToolbar
            query={query}
            sort={sort}
            view={view}
            onQueryChange={setQuery}
            onSortChange={setSort}
            onViewChange={setView}
          />
          <div className="mt-4">
            {!filteredCategories.length ? (
              <div className="rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                No categories match your search.
              </div>
            ) : view === 'list' ? (
              <CategoryList
                categories={filteredCategories}
                sort={sort}
                pending={remove.isPending}
                onDelete={(id) => {
                  remove.mutate(id);
                }}
                onSortChange={setSort}
              />
            ) : (
              <CategoryCardGrid
                categories={filteredCategories}
                pending={remove.isPending}
                onDelete={(id) => {
                  remove.mutate(id);
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
