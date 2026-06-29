import { ArrowLeft, Pencil, Pin, Trash2 } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { Pagination } from "../../../shared/components/Pagination";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { CategoryIcon } from "../components/CategoryIcon";
import { useDeleteCategory, useGetCategory, useGetCategoryNotes } from "../hooks/useCategories";
import type { CategoryNoteFilters } from "../types/category.types";

export function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [pinned, setPinned] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<NonNullable<CategoryNoteFilters["sort"]>>("updated_desc");
  const deferredQuery = useDeferredValue(query);
  const category = useGetCategory(id);
  const filters: CategoryNoteFilters = {
    page,
    limit: 10,
    q: deferredQuery || undefined,
    pinned: pinned === "all" ? undefined : pinned === "true",
    from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
    sort,
  };
  const notes = useGetCategoryNotes(id, filters);
  const remove = useDeleteCategory();
  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/categories");
  useEffect(() => setPage(1), [deferredQuery, pinned, from, to, sort]);
  if (category.isPending)
    return (
      <div className="p-8 text-sm text-muted-foreground">Loading category…</div>
    );
  if (category.isError)
    return (
      <div className="p-8">
        <ErrorMessage message={getApiErrorMessage(category.error)} className="mb-4" />
        <Button type="button" onClick={goBack} variant="outline">
          Back
        </Button>
      </div>
    );
  const item = category.data;
  return (
    <div className="mx-auto max-w-7xl p-8">
      <Button type="button" variant="ghost" onClick={goBack} className="mb-5">
        <ArrowLeft size={16} /> Back
      </Button>
      {remove.isError && <ErrorMessage message={getApiErrorMessage(remove.error)} className="mb-5" />}
      <div className="mb-7 flex items-center gap-4">
        <span
          className="grid size-14 place-items-center rounded-2xl"
          style={{ background: `${item.color}14`, color: item.color }}
        >
          <CategoryIcon name={item.icon} size={25} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="m-0 text-2xl">{item.name}</h2>
            <Badge>{item.noteCount} memories</Badge>
          </div>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">
            {item.description}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <CategoryFormDialog
            category={item}
            trigger={
              <Button variant="outline">
                <Pencil size={15} /> Edit
              </Button>
            }
          />
          <ConfirmDialog
            title={`Delete “${item.name}”?`}
            description="This category can only be deleted when no memories use it. Memories are never deleted."
            confirmLabel="Delete category"
            pending={remove.isPending}
            onConfirm={() =>
              remove.mutate(item.id, {
                onSuccess: () => navigate("/categories", { replace: true }),
              })
            }
            trigger={
              <Button variant="destructive" disabled={remove.isPending}>
                <Trash2 size={15} /> Delete
              </Button>
            }
          />
        </div>
      </div>
      <div className="mb-5 grid grid-cols-[minmax(220px,1fr)_140px_150px_150px_170px] gap-2">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter memories…" />
        <Select value={pinned} onValueChange={setPinned}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pins</SelectItem>
            <SelectItem value="true">Pinned</SelectItem>
            <SelectItem value="false">Not pinned</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="Created from" />
        <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="Created to" />
        <Select value={sort} onValueChange={(value) => setSort(value as typeof sort)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_desc">Recently updated</SelectItem>
            <SelectItem value="created_desc">Recently created</SelectItem>
            <SelectItem value="title_asc">Title A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {notes.isPending ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading memories…</div>
      ) : notes.isError ? (
        <ErrorMessage message={getApiErrorMessage(notes.error)} className="p-5" />
      ) : notes.data.items.length ? (
        <>
        <div className="grid grid-cols-2 gap-4">
          {notes.data.items.map((note) => (
            <Link key={note.id} to={`/notes/${note.id}`} className="no-underline">
              <Card className="h-full transition hover:border-primary/30 hover:shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-2">
                    <h3 className="m-0 flex-1 text-sm text-foreground">{note.title}</h3>
                    {note.pinned && <Pin size={14} className="text-primary" />}
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {note.contentText}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    Updated {new Date(note.updatedAt).toLocaleString()}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Pagination page={notes.data.page} totalPages={notes.data.totalPages} total={notes.data.total} onChange={setPage} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No memories in this category yet.
        </div>
      )}
    </div>
  );
}
