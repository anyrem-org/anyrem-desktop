import { Bell, Database, Keyboard, Monitor, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AvatarPicker } from "../../avatars/components/AvatarPicker";
import { useSelectAvatar } from "../../avatars/hooks/useAvatars";
import type { AvatarOption } from "../../avatars/api/avatars.api";
import { useAuthStore } from "../../auth/store/auth.store";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../../shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
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
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { useUiStore } from "../../../shared/store/ui.store";
import { useClearSearchHistory } from "../../search/hooks/useSearch";
import type { Theme, TypoTolerance } from "../api/settings.api";
import {
  useConfigureTelegram,
  useRemoveTelegram,
  useSettings,
  useTestTelegram,
  useUpdateSettings,
} from "../hooks/useSettings";

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
        <p className="mb-0 mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

type ShortcutName = "search" | "create";
type ShortcutPayload = {
  shortcuts: Record<ShortcutName, string>;
  registered: Record<ShortcutName, boolean>;
};

const defaultShortcuts: ShortcutPayload = {
  shortcuts: {
    search: "CommandOrControl+Alt+Space",
    create: "CommandOrControl+Alt+N",
  },
  registered: { search: true, create: true },
};

const keyNames: Record<string, string> = {
  " ": "Space",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Enter: "Return",
  Escape: "Esc",
  "+": "Plus",
};

const shortcutFromEvent = (event: React.KeyboardEvent) => {
  if (["Control", "Meta", "Alt", "Shift"].includes(event.key)) return null;
  if (!event.ctrlKey && !event.metaKey && !event.altKey) return null;
  const codeKey = event.code === "Space"
    ? "Space"
    : /^Key[A-Z]$/.test(event.code)
      ? event.code.slice(3)
      : /^Digit[0-9]$/.test(event.code)
        ? event.code.slice(5)
        : null;
  const key =
    codeKey ??
    keyNames[event.key] ??
    (event.key.length === 1 ? event.key.toUpperCase() : event.key);
  return [
    event.ctrlKey || event.metaKey ? "CommandOrControl" : undefined,
    event.altKey ? "Alt" : undefined,
    event.shiftKey ? "Shift" : undefined,
    key,
  ]
    .filter(Boolean)
    .join("+");
};

const displayShortcut = (accelerator: string) =>
  accelerator.replace("CommandOrControl", "Ctrl/Cmd").replaceAll("+", " + ");

export function SettingsPage() {
  const settings = useSettings();
  const update = useUpdateSettings();
  const clearHistory = useClearSearchHistory();
  const configureTelegram = useConfigureTelegram();
  const testTelegram = useTestTelegram();
  const removeTelegram = useRemoveTelegram();
  const setActivityOpen = useUiStore((state) => state.setActivityOpen);
  const user = useAuthStore((state) => state.user);
  const selectAvatar = useSelectAvatar();
  const data = settings.data;
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);
  const [shortcutError, setShortcutError] = useState("");
  const [recordingShortcut, setRecordingShortcut] = useState<ShortcutName | null>(null);
  const [pendingShortcut, setPendingShortcut] = useState("");
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");

  useEffect(() => {
    if (!data) return;
    setActivityOpen(data.appearance.show_activity_panel);
  }, [data, setActivityOpen]);

  useEffect(() => {
    window.desktop?.getShortcuts().then(setShortcuts).catch(() => {});
  }, []);

  useEffect(() => {
    if (!data?.quick_access.shortcuts) return;
    (async () => {
      const search = await window.desktop?.setShortcut("search", data.quick_access.shortcuts.search);
      const create = await window.desktop?.setShortcut("create", data.quick_access.shortcuts.create);
      setShortcuts(create ?? search ?? { shortcuts: data.quick_access.shortcuts, registered: { search: false, create: false } });
    })();
  }, [data?.quick_access.shortcuts]);

  const save = (type: "appearance" | "search" | "recap", key: string, value: string | boolean) =>
    update.mutate([{ type, key, value }]);

  const saveShortcut = async (name: ShortcutName, accelerator: string) => {
    const result = await window.desktop?.setShortcut(name, accelerator);
    if (!result) return;
    setShortcuts(result);
    if (result.ok)
      await update.mutateAsync([
        { type: "quick_access", key: "shortcuts", value: result.shortcuts },
      ]);
    setShortcutError(result.ok ? "" : "Shortcut is already used by the system or another app.");
    setRecordingShortcut(null);
    setPendingShortcut("");
  };

  const captureShortcut = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.key === "Escape") {
      setRecordingShortcut(null);
      setPendingShortcut("");
      return;
    }
    if (event.key === "Enter" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      if (recordingShortcut && pendingShortcut) void saveShortcut(recordingShortcut, pendingShortcut);
      return;
    }
    const accelerator = shortcutFromEvent(event);
    if (accelerator) setPendingShortcut(accelerator);
  };

  const resetShortcuts = async () => {
    const result = await window.desktop?.resetShortcuts();
    if (result) setShortcuts(result);
    if (result)
      await update.mutateAsync([
        { type: "quick_access", key: "shortcuts", value: result.shortcuts },
      ]);
    setShortcutError("");
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h2 className="mb-1 text-2xl">Settings</h2>
      <p className="mt-0 text-sm text-muted-foreground">
        Configure how Remember Anything behaves.
      </p>
      {settings.isPending && (
        <p className="mt-7 text-sm text-muted-foreground">Loading settings...</p>
      )}
      {settings.isError && (
        <ErrorMessage
          message={getApiErrorMessage(settings.error)}
          className="mt-7"
        />
      )}
      {data && (
        <div className="mt-7 space-y-5">
          <Card>
            <CardHeader>
              <div>
                <h3 className="m-0 text-base">Avatar</h3>
                <p className="m-0 text-xs text-muted-foreground">
                  Browse local DiceBear avatars by style.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <AvatarPicker
                value={user?.avatarId}
                initialStyle={user?.avatar?.style}
                disabled={selectAvatar.isPending}
                onChange={(avatar: AvatarOption) => selectAvatar.mutate(avatar.id)}
              />
              {selectAvatar.isPending ? (
                <p className="text-xs text-muted-foreground">Saving avatar...</p>
              ) : null}
            </CardContent>
          </Card>

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
                  checked={data.search.search_as_you_type}
                  onCheckedChange={(value) =>
                    save("search", "search_as_you_type", value)
                  }
                />
              </SettingRow>
              <SettingRow
                title="Save search history"
                description="Show recent searches when the field is focused."
              >
                <Switch
                  checked={data.search.save_history}
                  onCheckedChange={(value) =>
                    save("search", "save_history", value)
                  }
                />
              </SettingRow>
              <SettingRow
                title="Typo tolerance"
                description="Allow light spelling mistakes in search."
              >
                <Select
                  value={data.search.typo_tolerance}
                  onValueChange={(value) =>
                    save("search", "typo_tolerance", value as TypoTolerance)
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BALANCED">Balanced</SelectItem>
                    <SelectItem value="STRICT">Strict</SelectItem>
                    <SelectItem value="FLEXIBLE">Flexible</SelectItem>
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
                <Switch
                  checked={data.appearance.show_activity_panel}
                  onCheckedChange={(value) => {
                    setActivityOpen(value);
                    save("appearance", "show_activity_panel", value);
                  }}
                />
              </SettingRow>
              <SettingRow
                title="Compact density"
                description="Reduce spacing to fit more memories."
              >
                <Switch
                  checked={data.appearance.compact_density}
                  onCheckedChange={(value) =>
                    save("appearance", "compact_density", value)
                  }
                />
              </SettingRow>
              <SettingRow title="Theme" description="Choose app color mode.">
                <Select
                  value={data.appearance.theme}
                  onValueChange={(value) =>
                    save("appearance", "theme", value as Theme)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIGHT">Light</SelectItem>
                    <SelectItem value="DARK">Dark</SelectItem>
                    <SelectItem value="SYSTEM">System</SelectItem>
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
                  Configure summary delivery.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <SettingRow
                title="Enable daily recap"
                description="Prepare a summary of memories captured today."
              >
                <Switch
                  checked={data.recap.enabled}
                  onCheckedChange={(value) => save("recap", "enabled", value)}
                />
              </SettingRow>
              <SettingRow
                title="Delivery time"
                description="Local time for the scheduled recap."
              >
                <Input
                  type="time"
                  defaultValue={data.recap.delivery_time}
                  className="w-32"
                  disabled={!data.recap.enabled}
                  onBlur={(event) =>
                    save("recap", "delivery_time", event.target.value)
                  }
                />
              </SettingRow>
              <SettingRow
                title="Email delivery"
                description="Send daily recap by email."
              >
                <Switch
                  checked={data.recap.email_enabled}
                  disabled={!data.recap.enabled}
                  onCheckedChange={(value) =>
                    save("recap", "email_enabled", value)
                  }
                />
              </SettingRow>
              <SettingRow
                title="Telegram delivery"
                description="Send daily recap to configured Telegram chat."
              >
                <Switch
                  checked={data.recap.telegram_enabled}
                  disabled={!data.recap.enabled || !data.telegram.configured}
                  onCheckedChange={(value) =>
                    save("recap", "telegram_enabled", value)
                  }
                />
              </SettingRow>
              <Button
                variant="outline"
                className="mt-5"
                disabled={!data.recap.enabled}
              >
                Send test recap
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Bell size={18} />
              </span>
              <div>
                <h3 className="m-0 text-base">Telegram</h3>
                <p className="m-0 text-xs text-muted-foreground">
                  {data.telegram.configured
                    ? `Configured ${data.telegram.maskedChatId ?? ""}`
                    : "Connect a Telegram bot and chat."}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="password"
                  placeholder="Bot token"
                  value={botToken}
                  onChange={(event) => setBotToken(event.target.value)}
                />
                <Input
                  placeholder="Chat ID"
                  value={chatId}
                  onChange={(event) => setChatId(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  disabled={
                    configureTelegram.isPending || !botToken.trim() || !chatId.trim()
                  }
                  onClick={() =>
                    configureTelegram.mutate({
                      botToken: botToken.trim(),
                      chatId: chatId.trim(),
                    })
                  }
                >
                  {configureTelegram.isPending ? "Saving..." : "Save Telegram"}
                </Button>
                <Button
                  variant="outline"
                  disabled={!data.telegram.configured || testTelegram.isPending}
                  onClick={() => testTelegram.mutate()}
                >
                  {testTelegram.isPending ? "Sending..." : "Send test"}
                </Button>
                <Button
                  variant="outline"
                  disabled={!data.telegram.configured || removeTelegram.isPending}
                  onClick={() => removeTelegram.mutate()}
                >
                  Remove Telegram
                </Button>
              </div>
              {data.telegram.bot_username && (
                <p className="m-0 text-xs text-muted-foreground">
                  Bot: @{data.telegram.bot_username}
                </p>
              )}
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
                  Local shortcuts for background windows.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                <span>
                  <span className="block text-sm">Quick Search</span>
                  <span className="text-xs text-muted-foreground">
                    Click shortcut, then press new keys.
                  </span>
                </span>
                <button
                  type="button"
                  aria-label="Change Quick Search shortcut"
                  onClick={() => setRecordingShortcut("search")}
                  className="rounded-lg border bg-background px-3 py-1.5 text-xs hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {displayShortcut(shortcuts.shortcuts.search)}
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                <span>
                  <span className="block text-sm">Quick Create</span>
                  <span className="text-xs text-muted-foreground">
                    Click shortcut, then press new keys.
                  </span>
                </span>
                <button
                  type="button"
                  aria-label="Change Quick Create shortcut"
                  onClick={() => setRecordingShortcut("create")}
                  className="rounded-lg border bg-background px-3 py-1.5 text-xs hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {displayShortcut(shortcuts.shortcuts.create)}
                </button>
              </div>
              {!!shortcutError && (
                <p className="m-0 text-xs text-destructive">{shortcutError}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Use Ctrl/Cmd or Alt with another key. If a combo fails, it is taken by OS.
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={resetShortcuts}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
          <Dialog
            open={Boolean(recordingShortcut)}
            onOpenChange={(open) => {
              if (!open) {
                setRecordingShortcut(null);
                setPendingShortcut("");
              }
            }}
          >
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Change shortcut</DialogTitle>
                <DialogDescription>
                  Press desired key combination and then press Enter.
                </DialogDescription>
              </DialogHeader>
              <Input
                autoFocus
                readOnly
                value={pendingShortcut ? displayShortcut(pendingShortcut) : ""}
                onKeyDown={captureShortcut}
                className="h-11"
              />
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Database size={18} />
              </span>
              <div>
                <h3 className="m-0 text-base">Data</h3>
                <p className="m-0 text-xs text-muted-foreground">
                  Account data actions.
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" disabled>
                Export memories
              </Button>
              <Button
                variant="outline"
                onClick={() => clearHistory.mutate()}
                disabled={clearHistory.isPending}
              >
                {clearHistory.isPending
                  ? "Clearing..."
                  : "Clear search history"}
              </Button>
              {clearHistory.isError && (
                <ErrorMessage
                  message={getApiErrorMessage(clearHistory.error)}
                  className="basis-full"
                />
              )}
            </CardContent>
          </Card>

          {(update.isError ||
            selectAvatar.isError ||
            configureTelegram.isError ||
            testTelegram.isError ||
            removeTelegram.isError) && (
            <ErrorMessage
              message={getApiErrorMessage(
                update.error ??
                  selectAvatar.error ??
                  configureTelegram.error ??
                  testTelegram.error ??
                  removeTelegram.error,
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
