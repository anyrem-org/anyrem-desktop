import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { Switch } from '../../../shared/components/ui/switch';
import { getApiErrorMessage } from '../../../shared/lib/api-client';
import { InboxListItem } from '../components/InboxListItem';
import {
  useCreateInboxItem,
  useDeleteInboxItem,
  useInboxItems,
  useToggleInboxItem,
  useUpdateInboxItem,
} from '../hooks/useInbox';
import type { InboxFilters } from '../types/inbox.types';

const dateOptions: Array<{ label: string; value: NonNullable<InboxFilters['date']> }> = [
  { label: 'Any time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'this_week' },
  { label: 'This month', value: 'this_month' },
  { label: 'This year', value: 'this_year' },
];

export default function InboxPage() {
  const [date, setDate] = useState<NonNullable<InboxFilters['date']>>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [draft, setDraft] = useState('');
  const filters = { date, completed: showCompleted };

  const inbox = useInboxItems(filters);
  const create = useCreateInboxItem();
  const update = useUpdateInboxItem();
  const remove = useDeleteInboxItem();
  const toggle = useToggleInboxItem();
  const addItem = () => {
    const name = draft.trim();
    if (!name) return;
    create.mutate(name, { onSuccess: () => setDraft('') });
  };

  return (
    <main className="flex h-full min-h-0 flex-col bg-[#f7f8fc] p-6 lg:p-8">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-5">
        <header className="shrink-0 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture tasks before they slip away.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{inbox.data?.length ?? 0} items</span>
            <Select value={date} onValueChange={(value) => setDate(value as typeof date)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 whitespace-nowrap">
              Show completed <Switch checked={showCompleted} onCheckedChange={setShowCompleted} />
            </label>
          </div>
        </header>

        <form
          className="shrink-0 flex gap-2 rounded-xl border bg-background p-2 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            addItem();
          }}
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add an item to your inbox…"
            maxLength={500}
            disabled={create.isPending}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button type="submit" size="sm" disabled={!draft.trim() || create.isPending}>
            <Plus className="size-4" /> Add
          </Button>
        </form>

        {inbox.isPending ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading inbox…</p>
        ) : inbox.isError ? (
          <ErrorMessage message={getApiErrorMessage(inbox.error)} />
        ) : inbox.data?.length ? (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-2">
            {inbox.data.map((item) => (
              <InboxListItem
                key={item.id}
                item={item}
                pending={update.isPending || remove.isPending || toggle.isPending}
                onToggle={(id) => toggle.mutate(id)}
                onUpdate={(id, name) => update.mutate({ id, name })}
                onDelete={(id) => remove.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-background px-6 py-12 text-center text-sm text-muted-foreground">
            Nothing here yet. Add the next thing you need to remember.
          </div>
        )}
      </div>
    </main>
  );
}
