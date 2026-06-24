import { ArrowUpRight, Clock3, FileText, Pin, Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Pagination } from "../../../shared/components/Pagination";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { useGetCategories } from "../../categories/hooks/useCategories";
import { NoteContent } from "../../notes/components/NoteContent";
import { useGetNote } from "../../notes/hooks/useNotes";
import type { Category } from "../../categories/types/category.types";
import type { Note } from "../../notes/types/note.types";
import { searchHistory } from "../api/search.api";
import { useSearchNotes } from "../hooks/useSearch";

type Filter = "all" | "today" | "pinned";

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text
    .toLocaleLowerCase()
    .indexOf(query.trim().toLocaleLowerCase());
  if (!query.trim() || index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-yellow-100 px-0.5 text-inherit">
        {text.slice(index, index + query.trim().length)}
      </mark>
      {text.slice(index + query.trim().length)}
    </>
  );
}

function SearchPreview({ note, query, categories }: { note?: Note; query: string; categories: Category[] }) {
  const detail = useGetNote(note?.id);
  if (!note)
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        Select a memory to preview.
      </div>
    );
  const noteCategories = categories.filter((category) =>
    note.categoryIds.includes(category.id),
  );
  return (
    <section className="scrollbar min-h-0 overflow-y-auto bg-[#f7f8fc]">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col p-8">
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-1.5">
            {noteCategories.map((category) => (
              <Badge
                key={category.id}
                style={{
                  background: `${category.color}14`,
                  color: category.color,
                }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
          <Button variant="ghost" size="icon" title="Pin memory">
            <Pin size={16} />
          </Button>
        </div>
        <h2 className="mb-2 mt-6 text-2xl leading-tight">
          <Highlight text={note.title} query={query} />
        </h2>
        <p className="m-0 text-xs text-muted-foreground">
          Edited {note.updatedAt} · {detail.data?.relatedIds.length ?? note.relatedIds.length} related memories
        </p>
        <div className="my-6 h-px bg-border" />
        <div className="flex-1">
          {detail.isPending && (
            <div className="rounded-3xl border bg-white p-10 text-sm text-muted-foreground shadow-sm">
              Loading memory…
            </div>
          )}
          {detail.isError && (
            <ErrorMessage message={getApiErrorMessage(detail.error)} />
          )}
          {detail.data && (
            <NoteContent
              html={detail.data.contentHtml}
              searchQuery={query}
              activeIndex={0}
              onMatchCountChange={() => {}}
              onActiveIndexChange={() => {}}
              onWideTableChange={() => {}}
              inline
            />
          )}
        </div>
        <div className="mt-8 rounded-xl border-l-4 border-primary bg-accent/60 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            Memory context
          </p>
          <p className="mb-0 mt-2 text-sm leading-6 text-muted-foreground">
            Connected to {noteCategories.map((item) => item.name).join(", ")}. Use
            fullscreen to edit content or inspect related memories.
          </p>
        </div>
        <div className="sticky bottom-0 mt-6 pb-2 pt-4">
          <div className="rounded-2xl bg-gradient-to-t from-[#f7f8fc] via-[#f7f8fc]/95 to-transparent p-1">
            <Button asChild className="w-full shadow-sm">
              <Link to={`/notes/${note.id}`} className="no-underline">
                Open full memory <ArrowUpRight size={15} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SearchHomePage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [focused, setFocused] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState("relevance");
  const [categoryId, setCategoryId] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>();
  const navigate = useNavigate();
  const deferredQuery = useDeferredValue(query);
  const categories = useGetCategories();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const search = useSearchNotes({
    q: deferredQuery,
    page,
    limit: 20,
    categoryId: categoryId === "all" ? undefined : categoryId,
    pinned: filter === "pinned" ? true : undefined,
    from: filter === "today" ? today.toISOString() : undefined,
    sort: sort as "relevance" | "recent",
  });
  const results = search.data?.items ?? [];
  const selected = results.find((note) => note.id === selectedId) ?? results[0];
  useEffect(() => setPage(1), [deferredQuery, filter, sort, categoryId]);
  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
  }, [selected, selectedId]);
  const move = (direction: number) => {
    const index = results.findIndex((note) => note.id === selected?.id);
    const next =
      results[Math.max(0, Math.min(results.length - 1, index + direction))];
    if (next) setSelectedId(next.id);
  };
  return (
    <div className="flex h-full min-h-[680px] flex-col bg-white">
      <div className="relative z-20 shrink-0 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`relative flex h-11 min-w-0 flex-1 items-center rounded-xl border bg-muted/40 ${focused ? "border-primary ring-2 ring-primary/10" : ""}`}
          >
            <Search className="ml-3 text-muted-foreground" size={18} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 120)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  move(1);
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  move(-1);
                }
                if (event.key === "Enter" && selected)
                  navigate(`/notes/${selected.id}`);
              }}
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm outline-none"
              placeholder="Search memories..."
            />
            {search.isFetching && (
              <span className="mr-3 text-xs text-muted-foreground">
                Searching…
              </span>
            )}
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mr-2 rounded-md border-0 bg-transparent p-1 text-muted-foreground hover:bg-muted"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <kbd className="rounded-lg border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
            ↑↓ select · Enter open
          </kbd>
        </div>
        {focused && !query && (
          <div className="absolute left-6 right-52 top-[62px] z-30 rounded-xl border bg-white p-2 shadow-xl">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recent searches
            </p>
            {searchHistory.map((item) => (
              <button
                key={item}
                onMouseDown={() => setQuery(item)}
                className="flex w-full items-center gap-2 rounded-lg border-0 bg-transparent px-2 py-2 text-left text-xs hover:bg-muted"
              >
                <Clock3 size={13} />
                {item}
              </button>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-2">
          {(["all", "today", "pinned"] as Filter[]).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={filter === item ? "secondary" : "ghost"}
              onClick={() => setFilter(item)}
              className="h-8 capitalize"
            >
              {item === "pinned" && <Pin size={13} />} {item}
            </Button>
          ))}
          <span className="ml-2 text-xs text-muted-foreground">
            {search.data?.total ?? 0} results
          </span>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="ml-auto h-8 w-40 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories.data ?? []).map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-8 w-36 border-0 bg-transparent text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Best match</SelectItem>
              <SelectItem value="recent">Recently edited</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(330px,46%)_1fr]">
        <section className="scrollbar min-h-0 overflow-y-auto border-r p-2">
          <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Search results
          </div>
          {search.isError && <ErrorMessage message={getApiErrorMessage(search.error)} className="m-3" />}
          {results.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedId(note.id)}
              onDoubleClick={() => navigate(`/notes/${note.id}`)}
              className={`group flex w-full items-start gap-3 rounded-xl border-0 p-3 text-left ${selected?.id === note.id ? "bg-[#f1f1ef]" : "bg-transparent hover:bg-muted/60"}`}
            >
              <FileText size={17} className="mt-0.5 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <strong className="truncate text-sm">
                    <Highlight text={note.title} query={query} />
                  </strong>
                  {note.pinned && (
                    <Pin
                      size={12}
                      className="shrink-0 text-amber-500"
                      fill="currentColor"
                    />
                  )}
                </span>
                <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                  {note.category} · Edited {note.updatedAt}
                </span>
                <span className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                  <Highlight text={note.content} query={query} />
                </span>
              </span>
            </button>
          ))}
          {!search.isFetching && !search.isError && !results.length && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No memory found.
            </div>
          )}
          {search.data && <Pagination page={search.data.page} totalPages={search.data.totalPages} total={search.data.total} onChange={setPage} />}
        </section>
        <SearchPreview note={selected} query={query} categories={categories.data ?? []} />
      </div>
    </div>
  );
}
