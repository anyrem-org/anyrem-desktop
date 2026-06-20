import { Edit3, ExternalLink, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { useUiStore } from "../../../shared/store/ui.store";
import { notes } from "../api/notes.api";

export function NoteDetailModal() {
  const id = useUiStore((state) => state.selectedNoteId);
  const close = () => useUiStore.getState().selectNote();
  const note = notes.find((item) => item.id === id);
  if (!note) return null;
  const related = notes.filter((item) => note.relatedIds.includes(item.id));
  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex max-h-[86vh] max-w-4xl overflow-hidden p-0">
        <div className="scrollbar min-w-0 flex-1 overflow-y-auto p-8">
          <div className="mb-6">
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
            <DialogTitle className="mb-2 mt-4 text-3xl leading-tight">
              {note.title}
            </DialogTitle>
            <DialogDescription>
              Updated {note.updatedAt} · 2 min read
            </DialogDescription>
          </div>
          <p className="text-[15px] leading-8 text-slate-600">{note.content}</p>
          <h3 className="mt-8 text-base">Key takeaway</h3>
          <p className="rounded-2xl border-l-4 border-indigo-400 bg-indigo-50 p-4 text-sm leading-6 text-slate-600">
            Ưu tiên luồng đơn giản, đo nhu cầu thật rồi mới mở rộng. Mỗi thay
            đổi cần dễ tìm lại và an toàn khi chạy lại.
          </p>
          <div className="mt-8 flex gap-2">
            <Button variant="outline">
              <Edit3 size={16} /> Edit
            </Button>
            <Button variant="outline">
              <Pin size={16} /> Pin
            </Button>
            <Button asChild className="ml-auto">
              <Link
                onClick={close}
                to={`/notes/${note.id}`}
                className="no-underline"
              >
                Open fullscreen <ExternalLink size={15} />
              </Link>
            </Button>
          </div>
        </div>
        <aside className="w-72 shrink-0 border-l bg-slate-50 p-6">
          <h3 className="mt-0 text-sm">Related content</h3>
          <p className="mb-5 text-xs text-slate-400">Linked memories</p>
          <div className="space-y-3">
            {related.map((item) => (
              <button
                key={item.id}
                onClick={() => useUiStore.getState().selectNote(item.id)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left"
              >
                <strong className="line-clamp-2 text-xs leading-5">
                  {item.title}
                </strong>
                <span
                  className="mt-2 block text-[11px]"
                  style={{ color: item.categoryColor }}
                >
                  {item.category}
                </span>
              </button>
            ))}
            {!related.length && (
              <p className="text-xs text-muted-foreground">
                No linked memories.
              </p>
            )}
          </div>
        </aside>
      </DialogContent>
    </Dialog>
  );
}
