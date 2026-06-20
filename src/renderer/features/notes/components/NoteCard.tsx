import { ArrowUpRight, Pin } from "lucide-react";
import type { Note } from "../types/note.types";
import { useUiStore } from "../../../shared/store/ui.store";

export function NoteCard({ note }: { note: Note }) {
  return (
    <button
      onClick={() => useUiStore.getState().selectNote(note.id)}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{
              background: `${note.categoryColor}14`,
              color: note.categoryColor,
            }}
          >
            {note.category}
            {note.categoryIds.length > 1 && ` +${note.categoryIds.length - 1}`}
          </span>
          <h3 className="mb-2 mt-3 text-base group-hover:text-primary">
            {note.title}
          </h3>
        </div>
        {note.pinned ? (
          <Pin
            size={16}
            className="shrink-0 text-amber-500"
            fill="currentColor"
          />
        ) : (
          <ArrowUpRight
            size={16}
            className="shrink-0 text-slate-300 group-hover:text-primary"
          />
        )}
      </div>
      <p className="line-clamp-2 text-sm leading-6 text-slate-500">
        {note.content}
      </p>
      <div className="mt-4 flex items-center">
        <span className="text-xs text-slate-400">
          {note.relatedIds.length} related
        </span>
        <span className="ml-auto text-xs text-slate-400">{note.updatedAt}</span>
      </div>
    </button>
  );
}
