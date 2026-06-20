import { useQuery } from "@tanstack/react-query";
import { Clock3, Search, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchHistory, searchNotes, suggestions } from "../api/search.api";
import { NoteCard } from "../../notes/components/NoteCard";

export function SearchHomePage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [focused, setFocused] = useState(false);
  const { data = [], isFetching } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchNotes(query),
  });
  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-10 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
          <Sparkles size={13} /> Your memory, instantly searchable
        </span>
        <h2 className="mb-2 text-3xl">What do you want to remember?</h2>
        <p className="text-sm text-slate-500">
          Search notes, ideas, decisions and everything you captured.
        </p>
      </div>
      <div className="relative mx-auto mb-8 max-w-3xl">
        <div
          className={`flex items-center rounded-2xl border bg-white px-5 shadow-lg shadow-indigo-100/60 ${focused ? "border-indigo-400 ring-4 ring-indigo-100" : "border-slate-200"}`}
        >
          <Search className="text-primary" size={22} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            className="h-16 min-w-0 flex-1 border-0 bg-transparent px-4 text-base outline-none"
            placeholder="Search anything..."
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="border-0 bg-transparent text-slate-400"
            >
              <X size={18} />
            </button>
          )}
          <kbd className="rounded-lg border bg-slate-50 px-2 py-1 text-[11px] text-slate-400">
            Enter
          </kbd>
        </div>
        {focused && !query && (
          <div className="absolute z-10 mt-2 w-full rounded-2xl border bg-white p-3 shadow-xl">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Recent searches
            </p>
            {searchHistory.map((item) => (
              <button
                key={item}
                onMouseDown={() => setQuery(item)}
                className="flex w-full items-center gap-3 rounded-xl border-0 bg-white px-3 py-2.5 text-left text-sm hover:bg-slate-50"
              >
                <Clock3 size={15} className="text-slate-400" />
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
      {!query && (
        <div className="mb-9 flex items-center justify-center gap-2">
          <span className="mr-1 text-xs text-slate-400">Try</span>
          {suggestions.map((item) => (
            <button
              key={item}
              onClick={() => setQuery(item)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 hover:border-indigo-300 hover:text-primary"
            >
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="m-0 text-lg">
          {query ? `Results for “${query}”` : "Recently opened"}
        </h2>
        <span className="text-xs text-slate-400">
          {isFetching ? "Searching…" : `${data.length} notes`}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {data.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
        {!isFetching && !data.length && (
          <div className="col-span-2 rounded-2xl border border-dashed p-12 text-center text-sm text-slate-400">
            No memory found. Try another keyword.
          </div>
        )}
      </div>
    </div>
  );
}
