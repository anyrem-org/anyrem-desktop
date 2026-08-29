import { ArrowDown, ArrowUp } from 'lucide-react';
import { Table, Theme } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { Badge } from '../../../shared/components/ui/badge';
import type { Category, CategorySort } from '../types/category.types';
import { CategoryActions } from './CategoryActions';
import { CategoryIcon } from './CategoryIcon';

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function CategoryList({
  categories,
  sort,
  pending,
  onDelete,
  onSortChange,
}: {
  categories: Category[];
  sort: CategorySort;
  pending: boolean;
  onDelete: (id: string) => void;
  onSortChange: (sort: CategorySort) => void;
}) {
  const sortButton = (key: 'updated' | 'note_count', label: string) => {
    const active = sort.startsWith(key);
    const descending = sort.endsWith('_desc');

    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 font-medium"
        onClick={() => {
          onSortChange(`${key}_${active && descending ? 'asc' : 'desc'}` as CategorySort);
        }}
      >
        {label}
        {active && (descending ? <ArrowDown size={14} /> : <ArrowUp size={14} />)}
      </button>
    );
  };

  return (
    <Theme
      appearance="inherit"
      accentColor="indigo"
      radius="medium"
      className="overflow-hidden rounded-xl border"
    >
      <Table.Root variant="ghost" layout="fixed">
        <Table.Header className="text-xs text-muted-foreground">
          <Table.Row>
            <Table.ColumnHeaderCell p="3" width="52%">
              Name
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell
              p="3"
              width="20%"
              aria-sort={
                sort.startsWith('updated')
                  ? sort.endsWith('_desc')
                    ? 'descending'
                    : 'ascending'
                  : 'none'
              }
            >
              {sortButton('updated', 'Last modified')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell
              p="3"
              width="12%"
              aria-sort={
                sort.startsWith('note_count')
                  ? sort.endsWith('_desc')
                    ? 'descending'
                    : 'ascending'
                  : 'none'
              }
            >
              {sortButton('note_count', 'Notes')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell p="3" width="16%">
              Actions
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {categories.map((category) => {
            return (
              <Table.Row key={category.id} className="hover:bg-muted/30">
                <Table.Cell p="3">
                  <Link
                    to={`/categories/${category.id}`}
                    className="flex min-w-0 items-center gap-3 text-foreground no-underline"
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-lg"
                      style={{ background: `${category.color}14`, color: category.color }}
                    >
                      <CategoryIcon name={category.icon} size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 block break-words font-medium">
                        {category.name}
                      </span>
                      {category.description && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {category.description}
                        </span>
                      )}
                    </span>
                  </Link>
                </Table.Cell>
                <Table.Cell p="3" className="text-muted-foreground">
                  {formatDate(category.updatedAt)}
                </Table.Cell>
                <Table.Cell p="3">
                  <Badge>{category.noteCount}</Badge>
                </Table.Cell>
                <Table.Cell p="3">
                  <CategoryActions
                    category={category}
                    compact
                    pending={pending}
                    onDelete={onDelete}
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Theme>
  );
}
