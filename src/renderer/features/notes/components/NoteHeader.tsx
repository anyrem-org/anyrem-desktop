import { ArrowLeft, Edit3, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import type { NoteRecord } from "../types/note.types";
import { NoteSearchBar } from "./NoteSearchBar";

type Props = {
  note: NoteRecord;
  searchQuery: string;
  matchCount: number;
  activeIndex: number;
  onSearchChange: (value: string) => void;
  onPreviousMatch: () => void;
  onNextMatch: () => void;
};

export function NoteHeader({
  note,
  searchQuery,
  matchCount,
  activeIndex,
  onSearchChange,
  onPreviousMatch,
  onNextMatch,
}: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#f7f8fc]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-8 pb-6 pt-8">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 text-sm text-slate-500 no-underline"
              >
                <ArrowLeft size={16} /> Back to search
              </Link>
              <div className="mt-5">
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
                <h2 className="mb-3 mt-5 max-w-3xl text-4xl leading-tight">
                  {note.title}
                </h2>
                <p className="text-sm text-slate-400">
                  Updated {new Date(note.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" size="icon" className="rounded-xl">
                <Pin size={17} />
              </Button>
              <Button asChild className="rounded-xl px-4">
                <Link to={`/notes/${note.id}/edit`} className="no-underline">
                  <Edit3 size={16} /> Edit
                </Link>
              </Button>
            </div>
          </div>
          <NoteSearchBar
            value={searchQuery}
            matchCount={matchCount}
            activeIndex={activeIndex}
            onChange={onSearchChange}
            onPrevious={onPreviousMatch}
            onNext={onNextMatch}
          />
        </div>
      </div>
    </header>
  );
}
