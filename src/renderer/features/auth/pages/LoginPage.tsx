import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { useAuthStore } from "../store/auth.store";
import { useLogin, useResendVerification } from "../hooks/useAuth";
import { googleAuthUrl } from "../api/auth.api";
import { AuthLayout } from "../components/AuthLayout";
import { GoogleIcon } from "../components/GoogleIcon";

const isUnverified = (error: unknown) =>
  getApiErrorMessage(error).toLowerCase().includes("not verified");

export function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const login = useLogin();
  const resend = useResendVerification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleStarted, setGoogleStarted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const authError = (location.state as { authError?: string } | null)?.authError;
  const destination = (location.state as { from?: string } | null)?.from ?? "/";

  // Reset the Google button when the window regains focus (user came back from
  // the browser without completing the flow, or cancelled it).
  useEffect(() => {
    const onFocus = () => setGoogleStarted(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (user) return <Navigate to="/" replace />;

  const startGoogle = () => {
    if (!window.desktop) {
      navigate("/login", {
        replace: true,
        state: { authError: "Google sign-in is only available in the desktop app." },
      });
      return;
    }
    setGoogleStarted(true);
    void window.desktop.openExternal(googleAuthUrl());
  };

  const emailLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;
    try {
      await login.mutateAsync({ email, password, deviceName: "AnyRem Desktop" });
      navigate(destination, { replace: true });
    } catch {
      /* mutation state renders error */
    }
  };

  const showResend = login.isError && isUnverified(login.error);

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your memories.">
      <Button
        variant="outline"
        className="w-full"
        disabled={googleStarted}
        onClick={startGoogle}
      >
        <GoogleIcon />{" "}
        {googleStarted ? "Continue in browser…" : "Continue with Google"}
      </Button>
      {(authError || login.isError) && (
        <ErrorMessage
          message={authError ?? getApiErrorMessage(login.error)}
          className="mt-4"
        />
      )}
      {showResend && (
        <div className="mt-2 text-xs text-muted-foreground">
          {resend.isSuccess ? (
            <span className="text-emerald-600">
              Verification email sent. Check your inbox.
            </span>
          ) : (
            <button
              type="button"
              className="border-0 bg-transparent p-0 text-primary underline"
              disabled={resend.isPending}
              onClick={() => resend.mutate(email)}
            >
              {resend.isPending ? "Sending…" : "Resend verification email"}
            </button>
          )}
        </div>
      )}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with email</span>
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
            <Link
              to="/forgot-password"
              className="text-xs text-primary no-underline hover:underline"
            >
              Forgot password?
            </Link>
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
        <Button className="w-full" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mb-0 mt-6 text-center text-xs text-muted-foreground">
        No account yet?{" "}
        <Link to="/register" className="text-primary no-underline hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
