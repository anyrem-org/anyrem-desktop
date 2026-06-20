import { ArrowLeft, Edit3, Pin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { notes } from "../api/notes.api";
import { NoteCard } from "../components/NoteCard";

export function NoteDetailPage() {
  const { id } = useParams();
  const note = notes.find((x) => x.id === id) ?? notes[0];
  return (
    <div className="mx-auto max-w-5xl p-8">
      <Link
        to="/"
        className="mb-7 inline-flex items-center gap-2 text-sm text-slate-500 no-underline"
      >
        <ArrowLeft size={16} /> Back to search
      </Link>
      <article className="rounded-3xl border bg-white p-10 shadow-sm">
        <div className="flex items-start">
          <div>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: `${note.categoryColor}14`,
                color: note.categoryColor,
              }}
            >
              {note.category}
              {note.categoryIds.length > 1 &&
                ` +${note.categoryIds.length - 1}`}
            </span>
            <h2 className="mb-3 mt-5 max-w-3xl text-4xl leading-tight">
              {note.title}
            </h2>
            <p className="text-sm text-slate-400">Updated {note.updatedAt}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="rounded-xl border p-2.5">
              <Pin size={17} />
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
              <Edit3 size={16} /> Edit
            </button>
          </div>
        </div>
        <div className="my-8 h-px bg-slate-100" />
        <p className="max-w-3xl text-base leading-8 text-slate-600">
          {note.content}
        </p>
      </article>
      <h3 className="mb-4 mt-8">Related memories</h3>
      <div className="grid grid-cols-2 gap-4">
        {notes
          .filter((x) => note.relatedIds.includes(x.id))
          .map((x) => (
            <NoteCard key={x.id} note={x} />
          ))}
      </div>
    </div>
  );
}
