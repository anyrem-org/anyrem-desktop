import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { useGetNote, useGetNotes, usePinNote } from "../hooks/useNotes";
import { useUiStore } from "../../../shared/store/ui.store";
import { NoteContent } from "../components/NoteContent";
import { NoteHeader } from "../components/NoteHeader";
import { RightInsightPanel } from "../components/RightInsightPanel";

export function NoteDetailPage() {
  const { id } = useParams();
  const query = useGetNote(id);
  const noteList = useGetNotes({ page: 1, limit: 100 });
  const pinNote = usePinNote();
  const panelOpen = useUiStore((state) => state.activityOpen);
  const setPanelOpen = useUiStore((state) => state.setActivityOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [fullContent, setFullContent] = useState(false);
  const autoCollapsedRef = useRef(false);

  const cycleMatch = (step: number) => {
    if (!matchCount) return;
    setActiveMatchIndex((current) => (current + step + matchCount) % matchCount);
  };

  useEffect(() => {
    const smallViewport = window.innerWidth < 1440;
    if (smallViewport && !autoCollapsedRef.current) {
      setPanelOpen(false);
      autoCollapsedRef.current = true;
    }
  }, [setPanelOpen]);

  if (query.isPending) return <div className="p-8 text-sm text-muted-foreground">Loading memory…</div>;
  if (query.isError) return <div className="p-8"><ErrorMessage message={getApiErrorMessage(query.error)} /></div>;
  const note = query.data;
  const related = (noteList.data?.items ?? []).filter((item) => note.relatedIds.includes(item.id));

  return (
    <div className="flex h-full min-h-0 bg-[#f7f8fc]">
      <section className="flex min-w-0 flex-1 flex-col">
        <NoteHeader
          note={note}
          searchQuery={searchQuery}
          matchCount={matchCount}
          activeIndex={activeMatchIndex}
          fullContent={fullContent}
          onToggleFullContent={() => setFullContent((value) => !value)}
          onTogglePin={() => pinNote.mutate({ id: note.id, pinned: !note.pinned })}
          pinPending={pinNote.isPending}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setActiveMatchIndex(0);
          }}
          onPreviousMatch={() => cycleMatch(-1)}
          onNextMatch={() => cycleMatch(1)}
        />
        <NoteContent
          html={note.contentHtml}
          searchQuery={searchQuery}
          activeIndex={activeMatchIndex}
          fullContent={fullContent}
          onMatchCountChange={setMatchCount}
          onActiveIndexChange={setActiveMatchIndex}
          onWideTableChange={(hasWide) => {
            if (hasWide && !autoCollapsedRef.current) {
              setPanelOpen(false);
              autoCollapsedRef.current = true;
            }
          }}
        />
      </section>
      <RightInsightPanel notes={related} open={panelOpen && !fullContent} />
    </div>
  );
}
