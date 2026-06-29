import {
  LogOut,
  Menu,
  PanelRight,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/store/auth.store";
import { useLogout } from "../features/auth/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../shared/components/ui/dropdown-menu";
import { useUiStore } from "../shared/store/ui.store";

const titles: Record<string, string> = {
  "/": "Home",
  "/search": "Search",
  "/categories": "Categories",
  "/graph": "Knowledge graph",
  "/settings": "Settings",
  "/notes/new": "New note",
};

export function TopHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const toggleActivity = useUiStore((state) => state.toggleActivity);
  return (
    <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
      <div>
        <p className="m-0 text-xs text-slate-400">Workspace / Personal</p>
        <h1 className="m-0 text-lg font-semibold">
          {pathname.startsWith("/notes/") && pathname !== "/notes/new"
            ? "Note detail"
            : (titles[pathname] ?? "Remember Anything")}
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/search"
          className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-400 no-underline lg:flex"
        >
          <Search size={16} /> Search everything{" "}
          <kbd className="ml-6 rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
            ⌘ K
          </kbd>
        </Link>
        <Link
          to="/notes/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground no-underline shadow-sm"
        >
          <Plus size={17} /> Quick note
        </Link>
        <button
          onClick={toggleActivity}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-500"
          aria-label="Toggle activity"
        >
          <PanelRight size={18} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="grid size-9 place-items-center rounded-full border-0 bg-slate-900 text-xs font-bold text-white"
              aria-label="Account menu"
            >
              {user?.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() ?? "U"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <span className="block">{user?.name}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/settings")}>
              <UserRound size={15} /> Account settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => {
                logout.mutate(undefined, { onSettled: () => navigate("/login", { replace: true }) });
              }}
            >
              <LogOut size={15} /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
