import { Check, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { cn } from "../../../shared/lib/utils";
import type { InboxItem } from "../types/inbox.types";

type Props = {
  item: InboxItem;
  pending?: boolean;
  onToggle: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function InboxListItem({ item, pending, onToggle, onUpdate, onDelete }: Props) {
  const [name, setName] = useState(item.name);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const completed = Boolean(item.completedAt);
  const save = () => {
    const nextName = name.trim();
    if (!nextName) {
      setError('Inbox item cannot be empty.');
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    setError('');
    if (nextName !== item.name) onUpdate(item.id, nextName);
  };

  return (
    <article className="group flex items-center gap-3 rounded-xl border bg-background px-4 py-3 shadow-sm transition-colors hover:border-primary/30">
      <button type="button" aria-label={completed ? "Mark incomplete" : "Mark complete"} onClick={() => onToggle(item.id)} disabled={pending} className={cn("grid size-5 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", completed ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/60 hover:border-primary")}>
        {completed && <Check className="size-3.5" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <Input ref={inputRef} value={name} onChange={(event) => { setName(event.target.value); setError(''); }} onBlur={save} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); if (event.key === "Escape") { setName(item.name); setError(''); event.currentTarget.blur(); } }} disabled={pending} aria-label="Inbox item" aria-invalid={Boolean(error)} className={cn("h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0", completed && "text-muted-foreground line-through", error && "text-destructive")} />
        {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{completed ? `Completed ${formatDate(item.completedAt!)}` : `Added ${formatDate(item.createdAt)}`}</p>
      </div>
      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" aria-label="Delete inbox item" onClick={() => onDelete(item.id)} disabled={pending}>
        <Trash2 className="size-4" />
      </Button>
    </article>
  );
}
