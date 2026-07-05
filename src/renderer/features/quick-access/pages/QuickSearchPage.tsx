import { ArrowDown, ArrowUp, CornerDownLeft, Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../shared/components/ui/badge";
import type { Note } from "../../notes/types/note.types";
import { useSearchNotes } from "../../search/hooks/useSearch";
import { QuickNoteDetail } from "../components/QuickNoteDetail";

export function QuickSearchPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [detail, setDetail] = useState<Note>();
  const navigate = useNavigate();
  const dismiss = () => {
    window.desktop?.closeQuickWindow();
  };
  const deferredQuery = useDeferredValue(query);
  const search = useSearchNotes({ q: deferredQuery, page: 1, limit: 20, sort: "relevance" });
  const data = search.data?.items ?? [];
  useEffect(() => setSelected(0), [query]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (detail) setDetail(undefined);
        else dismiss();
      }
      if (detail) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((index) => Math.min(index + 1, data.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((index) => Math.max(index - 1, 0));
      }
      if (event.key === "Enter" && data[selected]) {
        event.preventDefault();
        setDetail(data[selected]);
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [data, detail, selected]);
  if (detail)
    return (
      <QuickNoteDetail
        note={detail}
        onBack={() => setDetail(undefined)}
        onClose={dismiss}
        onOpenFull={() =>
          window.desktop
            ? window.desktop.openQuickResult(detail.id)
            : navigate(`/notes/${detail.id}`)
        }
      />
    );
  return (
    <main className="h-screen overflow-hidden bg-[#f7f8fc] p-3">
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
        <header className="window-drag flex h-16 shrink-0 items-center border-b px-5">
          <Search className="text-primary" size={21} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="window-no-drag h-16 min-w-0 flex-1 border-0 px-4 text-lg outline-none"
            placeholder="Search your memory..."
          />
          <span className="text-xs text-muted-foreground">
            {search.isFetching ? "Searching…" : `${search.data?.total ?? 0} results`}
          </span>
          <button
            onClick={dismiss}
            className="window-no-drag ml-3 rounded-lg border-0 bg-transparent p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </header>
        <div className="scrollbar min-h-0 flex-1 overflow-y-auto p-2">
          {data.map((note, index) => (
            <button
              key={note.id}
              onMouseEnter={() => setSelected(index)}
              onClick={() => setDetail(note)}
              className={`flex w-full items-center gap-4 rounded-xl border-0 p-3 text-left ${selected === index ? "bg-accent" : "bg-transparent"}`}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: note.categoryColor }}
              />
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm">{note.title}</strong>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {note.content}
                </span>
              </span>
              <Badge style={{ color: note.categoryColor }}>
                {note.category}
              </Badge>
              {selected === index && (
                <CornerDownLeft size={15} className="text-primary" />
              )}
            </button>
          ))}
          {!search.isFetching && !data.length && (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              No memory found.
            </div>
          )}
        </div>
        <footer className="flex h-11 shrink-0 items-center gap-4 border-t bg-muted/40 px-5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowUp size={12} />
            <ArrowDown size={12} /> navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft size={12} /> detail
          </span>
          <span className="ml-auto">Esc close</span>
        </footer>
      </section>
    </main>
  );
}
