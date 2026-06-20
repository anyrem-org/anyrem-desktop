import { CheckCircle2, Clock3, Send } from "lucide-react";
import { notes } from "../../notes/api/notes.api";

export function DailyRecapPage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h2 className="mb-1 text-2xl">Daily recap</h2>
      <p className="mt-0 text-sm text-slate-400">
        A quiet review of what you captured today.
      </p>
      <div className="mt-7 grid grid-cols-[1fr_280px] gap-5">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-primary">
                Today · June 20
              </p>
              <h3 className="mb-1 mt-2 text-xl">3 memories captured</h3>
            </div>
            <span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-primary">
              <Clock3 size={20} />
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: note.categoryColor }}
                />
                <div>
                  <strong className="text-sm">{note.title}</strong>
                  <span className="block text-xs text-slate-400">
                    {note.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={18} />
              <strong className="text-sm">Telegram ready</strong>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              Mock status. Integration comes with backend phase.
            </p>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm">
              <Send size={15} /> Preview recap
            </button>
          </div>
          <div className="rounded-2xl bg-slate-900 p-5 text-white">
            <p className="m-0 text-xs text-slate-400">Scheduled delivery</p>
            <strong className="mt-2 block text-2xl">22:00</strong>
            <span className="text-xs text-slate-400">Every day</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
