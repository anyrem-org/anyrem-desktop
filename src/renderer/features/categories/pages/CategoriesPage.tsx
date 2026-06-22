import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { CategoryIcon } from "../components/CategoryIcon";
import { useDeleteCategory, useGetCategories } from "../hooks/useCategories";

export function CategoriesPage() {
  const categories = useGetCategories();
  const remove = useDeleteCategory();
  if (categories.isPending)
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Loading categories…
      </div>
    );
  if (categories.isError)
    return (
      <div className="p-8">
        <ErrorMessage message={getApiErrorMessage(categories.error)} className="mb-4" />
        <Button variant="outline" onClick={() => categories.refetch()}>
          Retry
        </Button>
      </div>
    );
  return (
    <div className="p-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="mb-1 text-2xl">Categories</h2>
          <p className="m-0 text-sm text-muted-foreground">
            Browse memories by context.
          </p>
        </div>
        <CategoryFormDialog
          trigger={
            <Button>
              <Plus size={16} /> New category
            </Button>
          }
        />
      </div>
      {remove.isError && <ErrorMessage message={getApiErrorMessage(remove.error)} className="mt-5" />}
      {!categories.data.length ? (
        <div className="mt-7 rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No categories yet.
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-3 gap-4">
          {categories.data.map((category) => (
            <Card
              key={category.id}
              className="h-full transition hover:border-primary/30 hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span
                    className="grid size-11 place-items-center rounded-xl"
                    style={{
                      background: `${category.color}14`,
                      color: category.color,
                    }}
                  >
                    <CategoryIcon name={category.icon} />
                  </span>
                  <Badge>{category.noteCount} notes</Badge>
                </div>
                <h3 className="mb-1 mt-5 text-foreground">{category.name}</h3>
                <p className="min-h-10 text-xs leading-5 text-muted-foreground">
                  {category.description}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to={`/categories/${category.id}`}
                      className="no-underline"
                    >
                      <ExternalLink size={14} /> Open
                    </Link>
                  </Button>
                  <CategoryFormDialog
                    category={category}
                    trigger={
                      <Button size="sm" variant="ghost">
                        <Pencil size={14} /> Edit
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    title={`Delete “${category.name}”?`}
                    description="This category can only be deleted when no memories use it. Memories are never deleted."
                    confirmLabel="Delete category"
                    pending={remove.isPending}
                    onConfirm={() => remove.mutate(category.id)}
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto text-destructive"
                        disabled={remove.isPending}
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
