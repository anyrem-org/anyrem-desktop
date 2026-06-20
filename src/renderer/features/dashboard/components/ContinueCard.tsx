import { ArrowRight, Clock3 } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { useUiStore } from "../../../shared/store/ui.store";
import type { Note } from "../../notes/types/note.types";

export function ContinueCard({ note }: { note: Note }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Clock3 size={14} /> Continue where you left off
        </div>
        <h3 className="mb-2 mt-4 text-xl">{note.title}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {note.content}
        </p>
        <div className="mt-5 flex items-center">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              background: `${note.categoryColor}14`,
              color: note.categoryColor,
            }}
          >
            {note.category}
          </span>
          <span className="ml-3 text-xs text-muted-foreground">
            Last opened 18 min ago
          </span>
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => useUiStore.getState().selectNote(note.id)}
          >
            Continue <ArrowRight size={15} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
