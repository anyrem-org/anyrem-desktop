import {
  ArrowRight,
  CalendarCheck,
  ChevronRight,
  Folder,
  History,
  NotebookPen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../../shared/components/ui/card";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { useUiStore } from "../../../shared/store/ui.store";
import { CategoryIcon } from "../../categories/components/CategoryIcon";
import { ContinueCard } from "../components/ContinueCard";
import { DashboardSearch } from "../components/DashboardSearch";
import { useDashboard } from "../hooks/useDashboard";

export function DashboardPage() {
  const openNote = (id: string) => useUiStore.getState().selectNote(id);
  const dashboard = useDashboard();
  const data = dashboard.data;
  const today = data?.today ?? [];
  const recent = data?.recentlyActive ?? [];
  const topCategories = data?.topCategories ?? [];
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <DashboardSearch />
      {dashboard.isError && (
        <ErrorMessage message={getApiErrorMessage(dashboard.error)} />
      )}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_.9fr]">
        <div className="space-y-6">
          {data?.continue ? <ContinueCard note={data.continue} /> : null}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <h3 className="m-0 flex items-center gap-2 text-base">
                  <NotebookPen size={17} className="text-primary" /> Captured
                  today
                </h3>
                <p className="mb-0 mt-1 text-xs text-muted-foreground">
                  What entered your memory today.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/search" className="no-underline">
                  View all <ArrowRight size={14} />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboard.isPending && <p className="text-sm text-muted-foreground">Loading memories…</p>}
              {today.map((note) => (
                <button
                  key={note.id}
                  onClick={() => openNote(note.id)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-muted/50 p-3 text-left hover:border-primary/20 hover:bg-accent"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: note.categoryColor }}
                  />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">
                      {note.title}
                    </strong>
                    <span className="text-xs text-muted-foreground">
                      {note.category} · {note.updatedAt}
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground group-hover:text-primary"
                  />
                </button>
              ))}
              {!dashboard.isPending && !today.length && (
                <p className="text-sm text-muted-foreground">No memories captured today.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <h3 className="m-0 flex items-center gap-2 text-base">
                  <History size={17} className="text-sky-500" /> Recently active
                </h3>
                <p className="mb-0 mt-1 text-xs text-muted-foreground">
                  Quickly reopen your working context.
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {recent.map((note) => (
                <button
                  key={note.id}
                  onClick={() => openNote(note.id)}
                  className="rounded-xl border bg-background p-4 text-left hover:border-primary/30 hover:shadow-sm"
                >
                  <Badge className="mb-3" style={{ color: note.categoryColor }}>
                    {note.category}
                  </Badge>
                  <strong className="line-clamp-2 text-sm leading-5">
                    {note.title}
                  </strong>
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {note.occurredAt}
                  </span>
                </button>
              ))}
              {!dashboard.isPending && !recent.length && (
                <p className="col-span-2 text-sm text-muted-foreground">No recent activity yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="m-0 flex items-center gap-2 text-base">
                    <Folder size={16} className="text-purple-500" /> Focus
                    topics
                  </h3>
                  <p className="mb-0 mt-1 text-xs text-muted-foreground">
                    Top categories this week.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboard.isPending && <p className="text-sm text-muted-foreground">Loading topics…</p>}
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="flex items-center gap-3 text-foreground no-underline"
                >
                  <span
                    className="grid size-9 place-items-center rounded-xl"
                    style={{
                      background: `${category.color}14`,
                      color: category.color,
                    }}
                  >
                    <CategoryIcon name={category.icon} size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between text-sm">
                      <strong>{category.name}</strong>
                      <span className="text-xs text-muted-foreground">
                        {category.count} this week
                      </span>
                    </span>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${Math.max(24, category.count * 35)}%`,
                          background: category.color,
                        }}
                      />
                    </span>
                  </span>
                </Link>
              ))}
              {!dashboard.isPending && !topCategories.length && (
                <p className="text-sm text-muted-foreground">No focus topics yet.</p>
              )}
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-white text-primary shadow-sm">
                  <CalendarCheck size={19} />
                </span>
                <Badge className="bg-white text-green-700">
                  Ready at 22:00
                </Badge>
              </div>
              <h3 className="mb-2 mt-5 text-base">Daily recap preview</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Today you captured {data?.recapPreview.noteCount ?? today.length} memories across{" "}
                {new Set(today.flatMap((note) => note.categoryIds)).size}{" "}
                topics. Review them before the day fades.
              </p>
              <Button
                variant="outline"
                className="mt-2 w-full bg-white"
                asChild
              >
                <Link to="/recap" className="no-underline">
                  Open today’s recap <ArrowRight size={14} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
