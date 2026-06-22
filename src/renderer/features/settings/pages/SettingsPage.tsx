import { Bell, Database, Keyboard, Monitor, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import { Switch } from "../../../shared/components/ui/switch";

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-t py-4 first:border-0 first:pt-0 last:pb-0">
      <div>
        <Label>{title}</Label>
        <p className="mb-0 mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const [searchAsType, setSearchAsType] = useState(true);
  const [history, setHistory] = useState(true);
  const [rightPanel, setRightPanel] = useState(true);
  const [compact, setCompact] = useState(false);
  const [recap, setRecap] = useState(true);
  return (
    <div className="mx-auto max-w-7xl p-8">
      <h2 className="mb-1 text-2xl">Settings</h2>
      <p className="mt-0 text-sm text-muted-foreground">
        Configure how Remember Anything behaves.
      </p>
      <div className="mt-7 space-y-5">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Search size={18} />
            </span>
            <div>
              <h3 className="m-0 text-base">Search</h3>
              <p className="m-0 text-xs text-muted-foreground">
                Recall behavior and history.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <SettingRow
              title="Search as you type"
              description="Update results while entering a query."
            >
              <Switch
                checked={searchAsType}
                onCheckedChange={setSearchAsType}
              />
            </SettingRow>
            <SettingRow
              title="Save search history"
              description="Show recent searches when the field is focused."
            >
              <Switch checked={history} onCheckedChange={setHistory} />
            </SettingRow>
            <SettingRow
              title="Typo tolerance"
              description="Allow light spelling mistakes in mock search."
            >
              <Select defaultValue="balanced">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Monitor size={18} />
            </span>
            <div>
              <h3 className="m-0 text-base">Appearance</h3>
              <p className="m-0 text-xs text-muted-foreground">
                Desktop layout preferences.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <SettingRow
              title="Recently active panel"
              description="Show activity panel when app opens."
            >
              <Switch checked={rightPanel} onCheckedChange={setRightPanel} />
            </SettingRow>
            <SettingRow
              title="Compact density"
              description="Reduce spacing to fit more memories."
            >
              <Switch checked={compact} onCheckedChange={setCompact} />
            </SettingRow>
            <SettingRow
              title="Theme"
              description="Current phase supports light mode."
            >
              <Select defaultValue="light">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark" disabled>
                    Dark — later
                  </SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Bell size={18} />
            </span>
            <div>
              <h3 className="m-0 text-base">Daily recap</h3>
              <p className="m-0 text-xs text-muted-foreground">
                Mock configuration; delivery needs backend.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <SettingRow
              title="Enable daily recap"
              description="Prepare a summary of memories captured today."
            >
              <Switch checked={recap} onCheckedChange={setRecap} />
            </SettingRow>
            <SettingRow
              title="Delivery time"
              description="Local time for the scheduled recap."
            >
              <Input
                type="time"
                defaultValue="22:00"
                className="w-32"
                disabled={!recap}
              />
            </SettingRow>
            <SettingRow
              title="Telegram chat ID"
              description="Stored after backend integration."
            >
              <Input
                placeholder="e.g. 123456789"
                className="w-48"
                disabled={!recap}
              />
            </SettingRow>
            <Button variant="outline" className="mt-5" disabled={!recap}>
              Send test recap
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Keyboard size={18} />
            </span>
            <div>
              <h3 className="m-0 text-base">Quick access</h3>
              <p className="m-0 text-xs text-muted-foreground">
                Open lightweight windows while app runs in background.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
              <span className="text-sm">Quick Search</span>
              <kbd className="rounded-lg border bg-background px-2.5 py-1 text-xs">
                Ctrl/⌘ + Space
              </kbd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
              <span className="text-sm">Quick Create</span>
              <kbd className="rounded-lg border bg-background px-2.5 py-1 text-xs">
                Ctrl/⌘ + Shift + N
              </kbd>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Database size={18} />
            </span>
            <div>
              <h3 className="m-0 text-base">Data</h3>
              <p className="m-0 text-xs text-muted-foreground">
                Mock data management.
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="outline">Export memories</Button>
            <Button variant="outline">Clear search history</Button>
            <Button variant="destructive" className="ml-auto">
              Reset mock data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
