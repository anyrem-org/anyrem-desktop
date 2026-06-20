import {
  BookOpen,
  CalendarCheck,
  FolderKanban,
  Home,
  Network,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUiStore } from "../shared/store/ui.store";

const items = [
  ["/", Home, "Home"],
  ["/search", Search, "Search"],
  ["/notes/new", Plus, "New note"],
  ["/categories", FolderKanban, "Categories"],
  ["/graph", Network, "Graph"],
  ["/recap", CalendarCheck, "Daily recap"],
  ["/settings", Settings, "Settings"],
] as const;

export function Sidebar() {
  const open = useUiStore((state) => state.sidebarOpen);
  return (
    <aside
      className={`${open ? "w-60" : "w-[72px]"} flex shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4 transition-all`}
    >
      <div className="mb-7 flex h-10 items-center gap-3 px-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <BookOpen size={19} />
        </span>
        {open && (
          <div>
            <p className="m-0 whitespace-nowrap font-bold">Remember Anything</p>
            <p className="m-0 text-[11px] text-slate-400">Your second memory</p>
          </div>
        )}
      </div>
      <nav className="space-y-1">
        {items.map(([to, Icon, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium ${isActive ? "bg-accent text-accent-foreground" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`
            }
          >
            <Icon size={19} />
            {open && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-3 text-xs text-slate-500">
        {open ? (
          <>
            <strong className="text-slate-700">5 notes</strong>
            <p className="mb-0">captured this week</p>
          </>
        ) : (
          <span className="font-bold text-primary">5</span>
        )}
      </div>
    </aside>
  );
}
