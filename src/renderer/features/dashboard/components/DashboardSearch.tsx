import { Search, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import { useAuthStore } from "../../auth/store/auth.store";
import { avatarAssetUrl } from "../../avatars/api/avatars.api";
import { useSearchHistory } from "../../search/hooks/useSearch";

export function DashboardSearch() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const history = useSearchHistory(true);
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) {
      return "Good morning";
    } else if (currentHour >= 12 && currentHour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };
  return (
    <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl">
      <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-indigo-300">
        <Sparkles size={14} /> Memory Hub
      </div>
      <div className="mb-2 flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-sm font-bold text-white ring-1 ring-white/20">
          {user?.avatar?.filePath ? (
            <img
              src={avatarAssetUrl(user.avatar.filePath)}
              alt={user.name}
              className="size-full bg-white object-cover"
            />
          ) : (
            initials
          )}
        </span>
        <h2 className="m-0 text-3xl">
          {getGreeting()}, {user?.name ?? "Anh"}.
        </h2>
      </div>
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
      {(history.data?.length ?? 0) > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-slate-500">Recent</span>
          {history.data?.slice(0, 3).map((item) => (
            <button
              key={item.id}
              onClick={() =>
                navigate(`/search?q=${encodeURIComponent(item.keyword)}`)
              }
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
            >
              {item.keyword}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
