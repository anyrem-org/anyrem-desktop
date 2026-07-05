import { Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../../shared/components/ui/card";
import {
  parseUpdateStatus,
  type UpdateStatus,
} from "../types/update-status";

export function AppUpdatesCard() {
  const [version, setVersion] = useState("…");
  const [update, setUpdate] = useState<UpdateStatus>({ status: "idle" });

  useEffect(() => {
    void window.desktop?.getAppVersion().then(setVersion);
    return window.desktop?.onUpdateStatus((payload) =>
      setUpdate(parseUpdateStatus(payload)),
    );
  }, []);

  const check = () => {
    setUpdate({ status: "checking" });
    void window.desktop?.checkForUpdates();
  };

  const install = () => void window.desktop?.installUpdate();

  const statusText = (() => {
    switch (update.status) {
      case "checking":
        return "Checking for updates…";
      case "available":
        return `Update ${update.version} found. Downloading…`;
      case "downloading":
        return `Downloading… ${Math.round(update.percent)}%`;
      case "downloaded":
        return `AnyRem ${update.version} is ready to install.`;
      case "not-available":
        return "You are on the latest version.";
      case "error":
        return update.message;
      default:
        return "Updates are delivered from GitHub Releases.";
    }
  })();

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Download size={18} />
        </span>
        <div>
          <h3 className="m-0 text-base">App updates</h3>
          <p className="m-0 text-xs text-muted-foreground">
            Installed version {version}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <p className="m-0 flex-1 text-sm text-muted-foreground">{statusText}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={check}
          disabled={update.status === "checking" || update.status === "downloading"}
        >
          <RefreshCw size={14} />
          Check for updates
        </Button>
        {update.status === "downloaded" ? (
          <Button type="button" size="sm" onClick={install}>
            Restart to update
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
