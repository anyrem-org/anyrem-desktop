import { CheckCircle2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { useAuthStore } from "../store/auth.store";
import { useForgotPassword } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";

export function ForgotPasswordPage() {
  const user = useAuthStore((state) => state.user);
  const forgot = useForgotPassword();
  const [email, setEmail] = useState("");

  if (user) return <Navigate to="/" replace />;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;
    forgot.mutate(email);
  };

  if (forgot.isSuccess) {
    return (
      <AuthLayout title="Check your inbox" subtitle="Password reset requested.">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <CheckCircle2 className="text-emerald-500" size={48} />
          <p className="m-0 text-sm text-muted-foreground">
            If an account exists for <strong>{email}</strong>, we sent a reset
            link. Follow it to choose a new password.
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

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a link to set a new password."
    >
      <form onSubmit={submit} className="space-y-4">
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
        {forgot.isError && (
          <ErrorMessage message={getApiErrorMessage(forgot.error)} />
        )}
        <Button className="w-full" disabled={forgot.isPending}>
          {forgot.isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mb-0 mt-6 text-center text-xs text-muted-foreground">
        Remembered it?{" "}
        <Link to="/login" className="text-primary no-underline hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
