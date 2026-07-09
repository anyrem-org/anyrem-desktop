import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { Button } from '../../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { getApiErrorMessage } from '../../../shared/lib/api-client';
import { useUiStore } from '../../../shared/store/ui.store';
import { NoteContent } from './NoteContent';
import { useGetNote, useGetNotes } from '../hooks/useNotes';
import { useRef, useState } from 'react';

export function NoteDetailModal() {
  const id = useUiStore((state) => state.selectedNoteId);
  const close = () => useUiStore.getState().selectNote();
  if (!id) return null;
  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex max-h-[90vh] max-w-7xl overflow-hidden p-0">
        <NoteDetailModalBody id={id} close={close} />
      </DialogContent>
    </Dialog>
  );
}

function NoteDetailModalBody({ id, close }: { id: string; close: () => void }) {
  const query = useGetNote(id);
  const noteList = useGetNotes({ page: 1, limit: 100 });
  const note = query.data;
  const related = (noteList.data?.items ?? []).filter((item) => note?.relatedIds.includes(item.id));
  const [hasScroll, setHasScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        ref={scrollRef}
        className="scrollbar min-w-0 flex-1 overflow-y-auto px-8 pb-8"
        onScroll={(e) => setHasScroll(e.currentTarget.scrollTop > 0)}
      >
        {query.isPending && <p className="text-sm text-muted-foreground">Loading memory...</p>}
        {query.isError && <ErrorMessage message={getApiErrorMessage(query.error)} />}
        {note && (
          <>
            <div
              className={`sticky top-0 z-10 -mx-8 bg-white px-8 pt-8 pb-6 ${hasScroll ? 'drop-shadow-md' : ''}`}
            >
              <div className="flex items-start gap-3 w-full">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: `${note.categoryColor}14`,
                    color: note.categoryColor,
                  }}
                >
                  {note.category}
                  {note.categoryIds.length > 1 && ` +${note.categoryIds.length - 1}`}
                </span>
                <Button asChild className="ml-auto shrink-0">
                  <Link onClick={close} to={`/notes/${note.id}`} className="no-underline">
                    View detail <ExternalLink size={15} />
                  </Link>
                </Button>
              </div>
              <DialogTitle className="mb-2 mt-2 text-3xl leading-tight">{note.title}</DialogTitle>
              <DialogDescription>Updated {note.updatedAt}</DialogDescription>
            </div>
            {hasScroll ? (
              <Button
                className="absolute bottom-4 right-80"
                onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-arrow-up-icon lucide-arrow-up"
                >
                  <path d="m5 12 7-7 7 7" />
                  <path d="M12 19V5" />
                </svg>
              </Button>
            ) : null}
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
              <strong className="line-clamp-2 text-xs leading-5">{item.title}</strong>
              <span className="mt-2 block text-[11px]" style={{ color: item.categoryColor }}>
                {item.category}
              </span>
            </button>
          ))}
          {!related.length && <p className="text-xs text-muted-foreground">No linked memories.</p>}
        </div>
      </aside>
    </>
  );
}
