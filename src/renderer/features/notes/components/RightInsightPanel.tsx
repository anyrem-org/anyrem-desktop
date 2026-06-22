import { NoteCard } from "./NoteCard";
import type { Note } from "../types/note.types";

type Props = {
  notes: Note[];
  open: boolean;
};

export function RightInsightPanel({ notes, open }: Props) {
  if (!open) return null;

  return (
    <aside className="scrollbar hidden w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white xl:block">
      <div className="sticky top-0 border-b border-slate-100 bg-white px-5 py-4">
        <h3 className="m-0 text-base">Related memories</h3>
        <p className="mb-0 mt-1 text-xs text-slate-400">Linked from current note</p>
      </div>
      <div className="space-y-4 p-5">
        {notes.length ? (
          notes.map((note) => <NoteCard key={note.id} note={note} />)
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
            No linked memories.
          </p>
        )}
      </div>
    </aside>
  );
}
