import { Eye, FilePenLine } from "lucide-react";
import { useUiStore } from "../../../shared/store/ui.store";
import { useRecentActivity } from "../hooks/useActivity";

export function ActivityPanel() {
  const open = useUiStore((state) => state.activityOpen);
  const activity = useRecentActivity(open);
  const items = activity.data?.items ?? [];
  if (!open) return null;
  return (
    <aside className="scrollbar w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="m-0 text-base">Recently active</h2>
        <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
          {activity.data?.todayCount ?? 0} today
        </span>
      </div>
      <div className="space-y-4">
        {activity.isPending && (
          <p className="text-xs text-slate-400">Loading activity...</p>
        )}
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => useUiStore.getState().selectNote(item.note.id)}
            className="flex w-full gap-3 border-0 bg-transparent p-0 text-left"
          >
            <span
              className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${i % 2 ? "bg-sky-50 text-sky-600" : "bg-indigo-50 text-indigo-600"}`}
            >
              {item.type === "VIEWED" ? (
                <Eye size={15} />
              ) : (
                <FilePenLine size={15} />
              )}
            </span>
            <span>
              <strong className="line-clamp-2 text-xs leading-5">
                {item.note.title}
              </strong>
              <span className="mt-1 block text-[11px] text-slate-400">
                {item.label} · {item.occurredAt}
              </span>
            </span>
          </button>
        ))}
        {!activity.isPending && !items.length && (
          <p className="text-xs text-slate-400">No activity yet.</p>
        )}
      </div>
    </aside>
  );
}
