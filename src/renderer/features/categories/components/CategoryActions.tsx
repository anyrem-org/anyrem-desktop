import { Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { Button } from '../../../shared/components/ui/button';
import { CategoryFormDialog } from './CategoryFormDialog';
import type { Category } from '../types/category.types';

export function CategoryActions({
  category,
  compact = false,
  pending,
  onDelete,
}: {
  category: Category;
  compact?: boolean;
  pending: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="flex gap-1"
      onClick={(event) => {
        event.preventDefault();
      }}
    >
      <CategoryFormDialog
        category={category}
        trigger={
          <Button
            size={compact ? 'icon' : 'sm'}
            variant="ghost"
            aria-label={`Edit ${category.name}`}
          >
            <Pencil size={14} />
            {!compact && ' Edit'}
          </Button>
        }
      />
      <ConfirmDialog
        title={`Delete “${category.name}”?`}
        description="This category can only be deleted when no memories use it. Memories are never deleted."
        confirmLabel="Delete category"
        pending={pending}
        onConfirm={() => {
          onDelete(category.id);
        }}
        trigger={
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            disabled={pending}
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 size={14} />
          </Button>
        }
      />
    </div>
  );
}
