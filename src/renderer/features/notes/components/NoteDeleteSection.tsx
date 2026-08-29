import { Trash2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { cn } from '../../../shared/lib/utils';
import { NoteDeleteButton } from './NoteDeleteButton';

export function NoteDeleteSection({
  id,
  title,
  onDeleted,
  className,
}: {
  id: string;
  title: string;
  onDeleted?: () => void;
  className?: string;
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <p className="m-0 mb-3 text-xs text-muted-foreground">
        Permanently remove this memory. This cannot be undone.
      </p>
      <NoteDeleteButton
        id={id}
        title={title}
        onDeleted={onDeleted}
        trigger={
          <Button
            type="button"
            variant="outline"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/5"
            aria-label={`Delete ${title}`}
          >
            <Trash2 size={15} /> Delete memory
          </Button>
        }
      />
    </section>
  );
}
