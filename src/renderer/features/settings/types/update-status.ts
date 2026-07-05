export type UpdateStatus =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; version: string }
  | { status: "not-available" }
  | { status: "downloading"; percent: number }
  | { status: "downloaded"; version: string }
  | { status: "error"; message: string };

export function parseUpdateStatus(raw: unknown): UpdateStatus {
  if (!raw || typeof raw !== "object") return { status: "idle" };
  const payload = raw as Record<string, unknown>;
  switch (payload.status) {
    case "checking":
      return { status: "checking" };
    case "available":
      return {
        status: "available",
        version: typeof payload.version === "string" ? payload.version : "",
      };
    case "not-available":
      return { status: "not-available" };
    case "downloading":
      return {
        status: "downloading",
        percent: typeof payload.percent === "number" ? payload.percent : 0,
      };
    case "downloaded":
      return {
        status: "downloaded",
        version: typeof payload.version === "string" ? payload.version : "",
      };
    case "error":
      return {
        status: "error",
        message: typeof payload.message === "string" ? payload.message : "Update failed",
      };
    default:
      return { status: "idle" };
  }
}
