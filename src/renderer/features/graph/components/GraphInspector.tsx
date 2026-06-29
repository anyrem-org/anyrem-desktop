import { ExternalLink, FileText, Folder, Link2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import type { GraphCategory, GraphNote } from "../api/graph.api";

export function GraphInspector({
  nodeId,
  categories,
  notes,
  onClose,
  onSelect,
}: {
  nodeId?: string;
  categories: GraphCategory[];
  notes: GraphNote[];
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  if (!nodeId) return null;
  const type = nodeId.startsWith("category-") ? "category" : "note";
  const id = nodeId.slice(type === "category" ? 9 : 5);
  if (type === "category") {
    const category = categories.find((item) => item.id === id);
    if (!category) return null;
    const matched = notes.filter((note) => note.categoryIds.includes(id));
    return (
      <aside className="absolute bottom-4 right-4 top-4 z-10 flex w-80 flex-col overflow-hidden rounded-2xl border bg-white/95 shadow-2xl backdrop-blur">
        <header className="flex items-start border-b p-5">
          <span
            className="grid size-10 place-items-center rounded-xl"
            style={{ background: `${category.color}14`, color: category.color }}
          >
            <Folder size={18} />
          </span>
          <div className="ml-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </span>
            <h3 className="m-0 text-base">{category.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg border-0 bg-transparent p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X size={16} />
          </button>
        </header>
        <div className="scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          <p className="mt-0 text-sm leading-6 text-muted-foreground">
            {category.description}
          </p>
          <div className="my-5 flex gap-2">
            <Badge>{matched.length} memories</Badge>
            <Badge className="bg-accent text-accent-foreground">
              {matched.reduce((sum, note) => sum + note.relatedIds.length, 0)}{" "}
              links
            </Badge>
          </div>
          <h4 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Memories in category
          </h4>
          <div className="space-y-2">
            {matched.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelect(`note-${note.id}`)}
                className="flex w-full items-center gap-3 rounded-xl border bg-white p-3 text-left hover:border-primary/30"
              >
                <FileText size={15} style={{ color: category.color }} />
                <span className="min-w-0">
                  <strong className="block truncate text-xs">
                    {note.title}
                  </strong>
                  <span className="text-[11px] text-muted-foreground">
                    {note.updatedAt}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <footer className="border-t p-4">
          <Button asChild className="w-full" variant="outline">
            <Link to={`/categories/${category.id}`} className="no-underline">
              Open category <ExternalLink size={14} />
            </Link>
          </Button>
        </footer>
      </aside>
    );
  }
  const note = notes.find((item) => item.id === id);
  if (!note) return null;
  const noteCategories = categories.filter((category) =>
    note.categoryIds.includes(category.id),
  );
  const related = notes.filter((item) => note.relatedIds.includes(item.id));
  return (
    <aside className="absolute bottom-4 right-4 top-4 z-10 flex w-80 flex-col overflow-hidden rounded-2xl border bg-white/95 shadow-2xl backdrop-blur">
      <header className="flex items-start border-b p-5">
        <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-primary">
          <FileText size={18} />
        </span>
        <div className="ml-3 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Memory
          </span>
          <h3 className="m-0 line-clamp-2 text-sm leading-5">{note.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="ml-auto rounded-lg border-0 bg-transparent p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X size={16} />
        </button>
      </header>
      <div className="scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        <div className="flex flex-wrap gap-1.5">
          {noteCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(`category-${category.id}`)}
              className="rounded-full border-0 px-2.5 py-1 text-xs font-semibold"
              style={{
                background: `${category.color}14`,
                color: category.color,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600">{note.content}</p>
        <div className="my-5 h-px bg-border" />
        <h4 className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Link2 size={13} /> Related memories
        </h4>
        <div className="space-y-2">
          {related.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(`note-${item.id}`)}
              className="w-full rounded-xl bg-muted/60 p-3 text-left hover:bg-accent"
            >
              <strong className="line-clamp-2 text-xs leading-5">
                {item.title}
              </strong>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {item.category}
              </span>
            </button>
          ))}
          {!related.length && (
            <p className="text-xs text-muted-foreground">
              No related memories.
            </p>
          )}
        </div>
      </div>
      <footer className="border-t p-4">
        <Button asChild className="w-full">
          <Link to={`/notes/${note.id}`} className="no-underline">
            Open memory <ExternalLink size={14} />
          </Link>
        </Button>
      </footer>
    </aside>
  );
}
