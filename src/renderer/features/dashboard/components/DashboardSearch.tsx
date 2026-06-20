import { Search, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import { searchHistory } from "../../search/api/search.api";

export function DashboardSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  return (
    <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl">
      <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-indigo-300">
        <Sparkles size={14} /> Memory Hub
      </div>
      <h2 className="mb-2 text-3xl">Good morning, Anh.</h2>
      <p className="mt-0 text-sm text-slate-300">
        What do you want to remember or continue?
      </p>
      <form
        onSubmit={submit}
        className="mt-7 flex items-center rounded-2xl bg-white p-2 shadow-lg"
      >
        <Search className="ml-3 text-slate-400" size={20} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-900 outline-none"
          placeholder="Search notes, decisions, ideas..."
        />
        <Button>Search</Button>
      </form>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-slate-500">Recent</span>
        {searchHistory.slice(0, 3).map((item) => (
          <button
            key={item}
            onClick={() => navigate(`/search?q=${encodeURIComponent(item)}`)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
