import { AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

export function ErrorMessage({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive",
        className,
      )}
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <p className="m-0">{message}</p>
    </div>
  );
}
