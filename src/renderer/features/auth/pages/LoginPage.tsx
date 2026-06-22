import { BookOpen, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { useAuthStore } from "../store/auth.store";
import { useLogin } from "../hooks/useAuth";
import { getApiErrorMessage } from "../../../shared/lib/api-client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.5 14a6 6 0 0 1 0-3.9V7.5H3.2a10 10 0 0 0 0 9.2L6.5 14Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.1c1.6 0 3 .5 4.1 1.6L19 4.9A9.7 9.7 0 0 0 3.2 7.5l3.3 2.6A5.8 5.8 0 0 1 12 6Z"
      />
    </svg>
  );
}

export function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: string } | null)?.from ?? "/";
  if (user) return <Navigate to="/" replace />;
  const emailLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;
    try {
      await login.mutateAsync({ email, password, deviceName: "AnyRem Desktop" });
      navigate(destination, { replace: true });
    } catch { /* mutation state renders error */ }
  };
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
              <h2 className="mb-2 text-2xl">Welcome back</h2>
              <p className="m-0 text-sm text-muted-foreground">
                Sign in to continue to your memories.
              </p>
            </div>
            <Button variant="outline" className="w-full" disabled title="Google sign-in comes later">
              <GoogleIcon /> Continue with Google
            </Button>
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">
                or continue with email
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={emailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="border-0 bg-transparent text-xs text-primary"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <LockKeyhole
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="px-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-muted-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {login.isError && <ErrorMessage message={getApiErrorMessage(login.error)} />}
              <Button className="w-full" disabled={login.isPending}>{login.isPending ? "Signing in…" : "Sign in"}</Button>
            </form>
            <p className="mb-0 mt-6 text-center text-xs text-muted-foreground">
              Use your verified Remember Anything account.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
