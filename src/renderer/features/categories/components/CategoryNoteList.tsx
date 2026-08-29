import { ArrowDown, Pin } from 'lucide-react';
import { Table, Theme } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import type { CategoryNoteFilters, CategoryNoteSummary } from '../types/category.types';

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function CategoryNoteList({
  notes,
  sort,
  onSortChange,
}: {
  notes: CategoryNoteSummary[];
  sort: NonNullable<CategoryNoteFilters['sort']>;
  onSortChange: (sort: NonNullable<CategoryNoteFilters['sort']>) => void;
}) {
  function sortButton(value: 'updated_desc' | 'created_desc', label: string) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 font-medium"
        onClick={() => {
          onSortChange(value);
        }}
      >
        {label}
        {sort === value && <ArrowDown size={14} />}
      </button>
    );
  }

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
            <Table.ColumnHeaderCell p="3" width="50%">
              Title
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell
              p="3"
              width="25%"
              aria-sort={sort === 'updated_desc' ? 'descending' : 'none'}
            >
              {sortButton('updated_desc', 'Modified at')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell
              p="3"
              width="25%"
              aria-sort={sort === 'created_desc' ? 'descending' : 'none'}
            >
              {sortButton('created_desc', 'Created at')}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {notes.map((note) => {
            return (
              <Table.Row key={note.id} className="hover:bg-muted/30">
                <Table.Cell p="3">
                  <Link
                    to={`/notes/${note.id}`}
                    className="flex min-w-0 items-start gap-2 font-medium text-foreground no-underline"
                  >
                    <span className="line-clamp-2 break-words">{note.title}</span>
                    {note.pinned && <Pin size={14} className="shrink-0 text-primary" />}
                  </Link>
                </Table.Cell>
                <Table.Cell p="3" className="text-muted-foreground">
                  {formatDate(note.updatedAt)}
                </Table.Cell>
                <Table.Cell p="3" className="text-muted-foreground">
                  {formatDate(note.createdAt)}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Theme>
  );
}
