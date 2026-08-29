import { LayoutGrid, List } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import type { CategoryView } from '../api/category-view.api';

export function CategoryViewToggle({
  view,
  onViewChange,
}: {
  view: CategoryView;
  onViewChange: (view: CategoryView) => void;
}) {
  return (
    <div className="flex h-10 rounded-xl border p-1" aria-label="View">
      <Button
        type="button"
        size="icon"
        className="size-8 rounded-lg"
        variant={view === 'card' ? 'secondary' : 'ghost'}
        aria-label="Card view"
        aria-pressed={view === 'card'}
        onClick={() => {
          onViewChange('card');
        }}
      >
        <LayoutGrid size={16} />
      </Button>
      <Button
        type="button"
        size="icon"
        className="size-8 rounded-lg"
        variant={view === 'list' ? 'secondary' : 'ghost'}
        aria-label="List view"
        aria-pressed={view === 'list'}
        onClick={() => {
          onViewChange('list');
        }}
      >
        <List size={16} />
      </Button>
    </div>
  );
}
