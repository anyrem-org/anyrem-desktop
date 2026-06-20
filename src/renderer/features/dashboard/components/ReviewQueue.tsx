import { Check, RotateCcw } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../../shared/components/ui/card";
import { useUiStore } from "../../../shared/store/ui.store";
import type { Note } from "../../notes/types/note.types";

export function ReviewQueue({ notes }: { notes: Note[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="m-0 text-base">Review queue</h3>
            <p className="mb-0 mt-1 text-xs text-muted-foreground">
              Memories worth refreshing.
            </p>
          </div>
          <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <RotateCcw size={17} />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex items-center gap-3 rounded-xl bg-muted/60 p-3"
          >
            <button
              onClick={() => useUiStore.getState().selectNote(note.id)}
              className="min-w-0 flex-1 border-0 bg-transparent text-left"
            >
              <strong className="block truncate text-sm">{note.title}</strong>
              <span className="text-xs text-muted-foreground">
                {note.category} · {note.updatedAt}
              </span>
            </button>
            <Button size="icon" variant="ghost" title="Mark reviewed">
              <Check size={16} />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
