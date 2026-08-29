import { Search } from 'lucide-react';
import { Input } from '../../../shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import type { CategoryView } from '../api/category-view.api';
import { CategoryViewToggle } from './CategoryViewToggle';
import type { CategorySort } from '../types/category.types';

export function CategoryViewToolbar({
  query,
  sort,
  view,
  onQueryChange,
  onSortChange,
  onViewChange,
}: {
  query: string;
  sort: CategorySort;
  view: CategoryView;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: CategorySort) => void;
  onViewChange: (view: CategoryView) => void;
}) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
          }}
          placeholder="Search categories"
          className="pl-9"
        />
      </div>
      {view === 'card' && (
        <Select
          value={sort}
          onValueChange={(value) => {
            onSortChange(value as CategorySort);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_desc">Modified ↓</SelectItem>
            <SelectItem value="updated_asc">Modified ↑</SelectItem>
            <SelectItem value="note_count_desc">Notes ↓</SelectItem>
            <SelectItem value="note_count_asc">Notes ↑</SelectItem>
          </SelectContent>
        </Select>
      )}
      <CategoryViewToggle view={view} onViewChange={onViewChange} />
    </div>
  );
}
