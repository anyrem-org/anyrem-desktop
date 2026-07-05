import { CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { useAuthStore } from "../store/auth.store";
import { useRegister } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";

const MIN_PASSWORD = 10;

export function RegisterPage() {
  const user = useAuthStore((state) => state.user);
  const registerMutation = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email || password.length < MIN_PASSWORD) return;
    registerMutation.mutate({ email, password, name: name.trim() });
  };

  if (registerMutation.isSuccess) {
    return (
      <AuthLayout title="Check your inbox" subtitle="One more step to finish signing up.">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <CheckCircle2 className="text-emerald-500" size={48} />
          <p className="m-0 text-sm text-muted-foreground">
            We sent a verification link to <strong>{email}</strong>. Open it to
            activate your account, then sign in.
          </p>
          <Button asChild className="w-full">
            <Link to="/login" className="no-underline">
              Back to sign in
            </Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD;

  return (
    <AuthLayout title="Create your account" subtitle="Start capturing and recalling in seconds.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <div className="relative">
            <UserRound
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="pl-9"
              maxLength={120}
              required
            />
          </div>
        </div>
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
          <Label htmlFor="password">Password</Label>
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
              placeholder="At least 10 characters"
              className="px-9"
              minLength={MIN_PASSWORD}
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
          {passwordTooShort && (
            <p className="m-0 text-xs text-amber-600">
              Password must be at least {MIN_PASSWORD} characters.
            </p>
          )}
        </div>
        {registerMutation.isError && (
          <ErrorMessage message={getApiErrorMessage(registerMutation.error)} />
        )}
        <Button
          className="w-full"
          disabled={registerMutation.isPending || passwordTooShort}
        >
          {registerMutation.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mb-0 mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary no-underline hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
