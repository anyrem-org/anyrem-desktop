import { useState, type FormEvent, type ReactNode } from "react";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { Button } from "../../../shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/components/ui/dialog";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { cn } from "../../../shared/lib/utils";
import { useCreateCategory, useUpdateCategory } from "../hooks/useCategories";
import type { Category, CategoryIcon as IconName } from "../types/category.types";
import { CategoryIcon, categoryIconNames } from "./CategoryIcon";

const colors = ["#6366f1", "#0ea5e9", "#a855f7", "#f59e0b", "#10b981", "#ef4444"];

export function CategoryFormDialog({ trigger, category, onSaved }: { trigger: ReactNode; category?: Category; onSaved?: (category: Category) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [color, setColor] = useState(category?.color ?? colors[0]);
  const [icon, setIcon] = useState<IconName | undefined>(category?.icon);
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const mutation = category ? update : create;
  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) { setName(category?.name ?? ""); setDescription(category?.description ?? ""); setColor(category?.color ?? colors[0]); setIcon(category?.icon); create.reset(); update.reset(); }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const input = { name: name.trim(), description: description.trim(), color, icon };
    try {
      const saved = category ? await update.mutateAsync({ id: category.id, input }) : await create.mutateAsync(input);
      onSaved?.(saved);
      setOpen(false);
    } catch { /* mutation state renders error */ }
  };
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? "Edit category" : "Create category"}</DialogTitle><DialogDescription>Group related memories under one context.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="category-name">Name</Label><Input id="category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Architecture" autoFocus required maxLength={100} /></div>
          <div className="space-y-2"><Label htmlFor="category-description">Description</Label><Input id="category-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What belongs here?" maxLength={500} /></div>
          <div className="space-y-2"><Label>Optional icon</Label><div className="flex gap-2"><Button type="button" variant={!icon ? "default" : "outline"} onClick={() => setIcon(undefined)}>None</Button>{categoryIconNames.map((item) => <Button type="button" key={item} variant={icon === item ? "default" : "outline"} size="icon" onClick={() => setIcon(item)}><CategoryIcon name={item} size={17} /></Button>)}</div></div>
          <div className="space-y-2"><Label>Color</Label><div className="flex gap-2">{colors.map((item) => <button type="button" key={item} onClick={() => setColor(item)} className={cn("size-8 rounded-full border-4 border-white shadow-sm ring-offset-2", color === item && "ring-2 ring-primary")} style={{ background: item }} aria-label={item} />)}</div></div>
          {mutation.isError && <ErrorMessage message={getApiErrorMessage(mutation.error)} />}
          <Button className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : category ? "Save changes" : "Create category"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
