import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { Button } from "../../../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { useUiStore } from "../../../shared/store/ui.store";
import { NoteContent } from "./NoteContent";
import { useGetNote, useGetNotes } from "../hooks/useNotes";

export function NoteDetailModal() {
  const id = useUiStore((state) => state.selectedNoteId);
  const close = () => useUiStore.getState().selectNote();
  if (!id) return null;
  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex max-h-[86vh] max-w-4xl overflow-hidden p-0">
        <NoteDetailModalBody id={id} close={close} />
      </DialogContent>
    </Dialog>
  );
}

function NoteDetailModalBody({ id, close }: { id: string; close: () => void }) {
  const query = useGetNote(id);
  const noteList = useGetNotes({ page: 1, limit: 100 });
  const note = query.data;
  const related = (noteList.data?.items ?? []).filter((item) =>
    note?.relatedIds.includes(item.id),
  );
  return (
    <>
        <div className="scrollbar min-w-0 flex-1 overflow-y-auto p-8">
          {query.isPending && (
            <p className="text-sm text-muted-foreground">Loading memory...</p>
          )}
          {query.isError && (
            <ErrorMessage message={getApiErrorMessage(query.error)} />
          )}
          {note && (
            <>
              <div className="mb-6">
                <div className="flex items-start gap-3">
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
                  <Button asChild className="ml-auto shrink-0">
                    <Link
                      onClick={close}
                      to={`/notes/${note.id}`}
                      className="no-underline"
                    >
                      View detail <ExternalLink size={15} />
                    </Link>
                  </Button>
                </div>
                <DialogTitle className="mb-2 mt-4 text-3xl leading-tight">
                  {note.title}
                </DialogTitle>
                <DialogDescription>Updated {note.updatedAt}</DialogDescription>
              </div>
              <NoteContent
                html={note.contentHtml}
                searchQuery=""
                activeIndex={0}
                onMatchCountChange={() => {}}
                onActiveIndexChange={() => {}}
                onWideTableChange={() => {}}
                inline
                chrome={false}
              />
            </>
          )}
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
    </>
  );
}
