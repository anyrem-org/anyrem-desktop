import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "../../../shared/components/ui/card";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen grid-cols-[1fr_560px] bg-slate-950">
      <section className="relative hidden overflow-hidden p-14 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,.38),transparent_36%),radial-gradient(circle_at_70%_70%,rgba(168,85,247,.22),transparent_35%)]" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10">
              <BookOpen size={20} />
            </span>
            <strong>Remember Anything</strong>
          </div>
          <div className="my-auto max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-indigo-300">
              Your second memory
            </p>
            <h1 className="m-0 text-5xl leading-tight">
              Capture once.
              <br />
              Recall anytime.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Keep ideas, decisions and useful context close—without turning
              your day into filing work.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Private workspace · Desktop-first
          </p>
        </div>
      </section>
      <section className="grid place-items-center bg-[#f7f8fc] p-10">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="mb-7">
              <span className="mb-5 grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground lg:hidden">
                <BookOpen size={20} />
              </span>
              <h2 className="mb-2 text-2xl">{title}</h2>
              <p className="m-0 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
