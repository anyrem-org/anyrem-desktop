import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { Button } from '../../../shared/components/ui/button';
import { useDeleteNote } from '../hooks/useNotes';

export function NoteDeleteButton({
  id,
  title,
  onDeleted,
  trigger,
}: {
  id: string;
  title: string;
  onDeleted?: () => void;
  trigger?: ReactNode;
}) {
  const remove = useDeleteNote();

  return (
    <ConfirmDialog
      title={`Delete “${title}”?`}
      description="This memory will be removed from your library. This action cannot be undone."
      confirmLabel="Delete memory"
      pending={remove.isPending}
      onConfirm={() => {
        remove.mutate(id, {
          onSuccess: () => {
            onDeleted?.();
          },
        });
      }}
      trigger={
        trigger ?? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={remove.isPending}
            aria-label={`Delete ${title}`}
          >
            <Trash2 size={16} /> Delete
          </Button>
        )
      }
    />
  );
}
