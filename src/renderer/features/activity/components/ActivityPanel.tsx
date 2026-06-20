import { Clock3, Eye, FilePenLine, Sparkles } from "lucide-react";
import { notes } from "../../notes/api/notes.api";
import { useUiStore } from "../../../shared/store/ui.store";

export function ActivityPanel() {
  const open = useUiStore((state) => state.activityOpen);
  if (!open) return null;
  return (
    <aside className="scrollbar w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="m-0 text-base">Recently active</h2>
        <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
          5 today
        </span>
      </div>
      <div className="space-y-4">
        {notes.slice(0, 4).map((note, i) => (
          <button
            key={note.id}
            onClick={() => useUiStore.getState().selectNote(note.id)}
            className="flex w-full gap-3 border-0 bg-transparent p-0 text-left"
          >
            <span
              className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${i % 2 ? "bg-sky-50 text-sky-600" : "bg-indigo-50 text-indigo-600"}`}
            >
              {i % 2 ? <Eye size={15} /> : <FilePenLine size={15} />}
            </span>
            <span>
              <strong className="line-clamp-2 text-xs leading-5">
                {note.title}
              </strong>
              <span className="mt-1 block text-[11px] text-slate-400">
                {i % 2 ? "Viewed" : "Edited"} · {note.updatedAt}
              </span>
            </span>
          </button>
        ))}
      </div>
      <hr className="my-6 border-slate-100" />
      <h3 className="mb-3 flex items-center gap-2 text-sm">
        <Sparkles size={16} className="text-amber-500" /> Today’s notes
      </h3>
      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="flex items-end justify-between">
          <strong className="text-3xl">3</strong>
          <Clock3 size={18} className="text-slate-400" />
        </div>
        <p className="mb-0 text-xs text-slate-500">
          notes captured · 8 min read
        </p>
      </div>
      <h3 className="mb-3 mt-6 text-sm">Quick filters</h3>
      <div className="flex flex-wrap gap-2">
        {["Pinned", "Today", "Electron", "Product"].map((x) => (
          <span
            key={x}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            {x}
          </span>
        ))}
      </div>
    </aside>
  );
}
