import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";

type Props = {
  value: string;
  matchCount: number;
  activeIndex: number;
  onChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function NoteSearchBar({
  value,
  matchCount,
  activeIndex,
  onChange,
  onPrevious,
  onNext,
}: Props) {
  const position = matchCount ? `${activeIndex + 1}/${matchCount}` : "0/0";

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
        <Search size={16} className="shrink-0 text-slate-400" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search in current note"
          className="h-8 border-0 px-0 py-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <span className="shrink-0 px-1 text-xs font-medium text-slate-400">
        {position}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={!matchCount}
        className="size-8 rounded-xl text-slate-500"
        aria-label="Previous match"
      >
        <ChevronUp size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!matchCount}
        className="size-8 rounded-xl text-slate-500"
        aria-label="Next match"
      >
        <ChevronDown size={16} />
      </Button>
    </div>
  );
}
