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
import type { Theme } from "../api/settings.api";
import {
  useConfigureTelegram,
  useRemoveTelegram,
  useSettings,
  useTestRecap,
  useTestTelegram,
  useUpdateSettings,
} from "../hooks/useSettings";
import type { RecapProvider } from "../../recap/api/recap.api";

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

const timezones = [
  ["Asia/Ho_Chi_Minh", "Vietnam"],
  ["Asia/Tokyo", "Japan"],
  ["Asia/Seoul", "Korea"],
  ["Asia/Singapore", "Singapore"],
  ["Asia/Bangkok", "Thailand"],
  ["Asia/Jakarta", "Indonesia"],
  ["Asia/Manila", "Philippines"],
  ["Asia/Kuala_Lumpur", "Malaysia"],
  ["Australia/Sydney", "Australia"],
  ["Europe/London", "United Kingdom"],
  ["Europe/Berlin", "Germany"],
  ["America/Los_Angeles", "US Pacific"],
  ["America/New_York", "US Eastern"],
] as const;

const timezoneOffset = (timeZone: string) =>
  new Intl.DateTimeFormat("en", {
    timeZone,
    timeZoneName: "shortOffset",
  })
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")
    ?.value.replace("GMT", "UTC") ?? timeZone;

const timezoneLabel = (value: string, label: string) =>
  `${label} - ${value} - ${timezoneOffset(value)}`;

const platform = () =>
  (window.desktop?.platform ?? navigator.platform).toLowerCase();
const isMac = () => platform().includes("mac");
const isLinux = () => platform().includes("linux");

// Map a KeyboardEvent.code to an Electron accelerator key token.
// Using `code` (physical key) avoids layout/locale issues from `event.key`.
const codeToAcceleratorKey = (code: string): string | null => {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit[0-9]$/.test(code)) return code.slice(5);
  if (/^Numpad[0-9]$/.test(code)) return `num${code.slice(6)}`;
  if (/^F[0-9]{1,2}$/.test(code)) return code;
  const named: Record<string, string> = {
    Space: "Space",
    Enter: "Return",
    NumpadEnter: "Return",
    Tab: "Tab",
    Backspace: "Backspace",
    Delete: "Delete",
    Insert: "Insert",
    Home: "Home",
    End: "End",
    PageUp: "PageUp",
    PageDown: "PageDown",
    ArrowUp: "Up",
    ArrowDown: "Down",
    ArrowLeft: "Left",
    ArrowRight: "Right",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Backslash: "\\",
    Semicolon: ";",
    Quote: "'",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Backquote: "`",
  };
  return named[code] ?? null;
};

type Modifiers = { ctrl: boolean; alt: boolean; shift: boolean; meta: boolean };

// Modifier tokens in a stable order. meta -> Command (mac) / Super (Win/Linux).
const modifierTokens = (mods: Modifiers): string[] => {
  const tokens: string[] = [];
  if (mods.meta) tokens.push(isMac() ? "Command" : "Super");
  if (mods.ctrl) tokens.push("Control");
  if (mods.alt) tokens.push("Alt");
  if (mods.shift) tokens.push("Shift");
  return tokens;
};

// A primary modifier (Ctrl/Alt/Cmd/Super) is required; Shift alone is invalid.
const buildAccelerator = (mods: Modifiers, key: string | null): string | null => {
  if (!key || !(mods.ctrl || mods.alt || mods.meta)) return null;
  return [...modifierTokens(mods), key].join("+");
};

const modifierLabel = (token: string): string => {
  const mac = isMac();
  switch (token) {
    case "CommandOrControl": // legacy stored value
      return mac ? "\u2318" : "Ctrl";
    case "Command":
      return mac ? "\u2318" : "Cmd";
    case "Super":
      return mac ? "\u2318" : "Super";
    case "Control":
      return mac ? "\u2303" : "Ctrl";
    case "Alt":
      return mac ? "\u2325" : "Alt";
    case "Shift":
      return mac ? "\u21e7" : "Shift";
    default:
      return token;
  }
};

const displayShortcut = (accelerator: string): string =>
  accelerator
    .split("+")
    .map(modifierLabel)
    .join(isMac() ? " " : " + ");

function ShortcutStatus({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] ${active ? "text-emerald-600" : "text-amber-600"}`}
      title={
        active
          ? "This shortcut is active and works in the background."
          : isLinux()
            ? "Not active in the background. Linux/Wayland restricts global shortcuts; it still works while the app is focused."
            : "Saved, but not active. The combo may be in use by another app."
      }
    >
      <span
        className={`size-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {active ? "Active" : "Not active"}
    </span>
  );
}

export function SettingsPage() {
  const settings = useSettings();
  const update = useUpdateSettings();
  const clearHistory = useClearSearchHistory();
  const configureTelegram = useConfigureTelegram();
  const testTelegram = useTestTelegram();
  const testRecap = useTestRecap();
  const removeTelegram = useRemoveTelegram();
  const setActivityOpen = useUiStore((state) => state.setActivityOpen);
  const user = useAuthStore((state) => state.user);
  const selectAvatar = useSelectAvatar();
  const data = settings.data;
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);
  const [shortcutError, setShortcutError] = useState("");
  const [shortcutNotice, setShortcutNotice] = useState("");
  const [recordingShortcut, setRecordingShortcut] = useState<ShortcutName | null>(null);
  const [pendingShortcut, setPendingShortcut] = useState("");
  const [livePreview, setLivePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [testRecapProvider, setTestRecapProvider] = useState<RecapProvider>("EMAIL");

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

  const save = (type: "appearance" | "search" | "recap" | "regional", key: string, value: string | boolean) =>
    update.mutate([{ type, key, value }]);

  const openRecorder = (name: ShortcutName) => {
    setShortcutError("");
    setShortcutNotice("");
    setPendingShortcut("");
    setLivePreview("");
    setRecordingShortcut(name);
  };

  const closeRecorder = () => {
    setRecordingShortcut(null);
    setPendingShortcut("");
    setLivePreview("");
  };

  const saveShortcut = async (name: ShortcutName, accelerator: string) => {
    setSaving(true);
    try {
      const result = await window.desktop?.setShortcut(name, accelerator);
      if (!result) {
        setShortcutError("Shortcuts are only available in the desktop app.");
        return;
      }
      setShortcuts(result);
      if (result.ok) {
        await update.mutateAsync([
          { type: "quick_access", key: "shortcuts", value: result.shortcuts },
        ]);
        // Wayland: saved, but the OS portal may confirm the binding later
        // (and can ask you to approve it). Show a soft note, not an error.
        // On Linux/Wayland, register() reports the real state. If it didn't bind,
        // it's usually the known Wayland limitation, not a bad shortcut.
        setShortcutNotice(
          result.pending && !result.registered[name]
            ? "Saved, but Linux/Wayland doesn't let apps register global shortcuts here, so it won't trigger in the background. It works while the app window is focused."
            : "",
        );
        closeRecorder();
      } else {
        const superHint = accelerator.includes("Super")
          ? " The Super/Windows key is often reserved by the desktop; try Ctrl or Alt instead."
          : "";
        setShortcutError(
          `${displayShortcut(accelerator)} is already used by the system or another app.${superHint} Try a different combination.`,
        );
        setPendingShortcut("");
        setLivePreview("");
      }
    } finally {
      setSaving(false);
    }
  };

  const captureShortcut = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Tab") return; // allow focus to leave the field
    event.preventDefault();

    if (event.key === "Escape") {
      closeRecorder();
      return;
    }

    // Plain Enter confirms the captured combo (like clicking Save).
    if (
      event.key === "Enter" &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey &&
      !event.shiftKey &&
      pendingShortcut &&
      recordingShortcut
    ) {
      void saveShortcut(recordingShortcut, pendingShortcut);
      return;
    }

    // Super/Windows key is reported inconsistently on Ubuntu/GNOME (metaKey may
    // be unset), so also detect it from the physical code.
    const metaByCode = /^(Meta|OS)(Left|Right)$/.test(event.code);
    const mods: Modifiers = {
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey || metaByCode,
    };
    const isModifierKey =
      ["Control", "Meta", "Alt", "Shift", "OS", "Super"].includes(event.key) ||
      metaByCode;
    const baseKey = isModifierKey ? null : codeToAcceleratorKey(event.code);

    // Live preview (works with modifiers only). A single keydown carries one
    // non-modifier key, so a valid combo arrives complete in one event.
    setLivePreview(
      [...modifierTokens(mods), ...(baseKey ? [baseKey] : [])]
        .map(modifierLabel)
        .join(isMac() ? " " : " + "),
    );

    if (isModifierKey || !baseKey) return; // wait for a real key

    const accelerator = buildAccelerator(mods, baseKey);
    if (!accelerator) {
      setShortcutError(
        `Hold ${isMac() ? "\u2318 Cmd, \u2325 Option," : "Ctrl, Alt,"} or Super together with the key. Shift alone isn't enough.`,
      );
      setPendingShortcut("");
      return;
    }
    setShortcutError("");
    setPendingShortcut(accelerator);
    // Don't auto-save; wait for the user to confirm with the Save button.
  };

  const clearLiveOnRelease = (event: React.KeyboardEvent<HTMLElement>) => {
    // If a full combo isn't captured yet and user releases all modifiers, reset preview.
    if (pendingShortcut) return;
    if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey)
      setLivePreview("");
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
        Configure how AnyRem behaves.
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
                  How searching and recent-search history work.
                </p>
              </div>
            </CardHeader>
            <CardContent>
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
                  Layout and color of the desktop app.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <SettingRow
                title="Recently active panel"
                description="Open the side panel of recent activity when the app starts."
              >
                <Switch
                  checked={data.appearance.show_activity_panel}
                  onCheckedChange={(value) => {
                    setActivityOpen(value);
                    save("appearance", "show_activity_panel", value);
                  }}
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
                  A daily summary of what you captured, sent to you automatically.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <SettingRow
                title="Enable daily recap"
                description="Turn the daily summary on or off."
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
                title="Timezone"
                description="Used to decide today's notes and recap send time."
              >
                <Select
                  value={data.regional.timezone}
                  onValueChange={(value) =>
                    save("regional", "timezone", value)
                  }
                >
                  <SelectTrigger className="w-[22rem] max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[22rem]">
                    {timezones.map(([value, label]) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="whitespace-nowrap"
                      >
                        {timezoneLabel(value, label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                description="Send the recap to your Telegram chat. Set up Telegram below first."
              >
                <Switch
                  checked={data.recap.telegram_enabled}
                  disabled={!data.recap.enabled || !data.telegram.configured}
                  onCheckedChange={(value) =>
                    save("recap", "telegram_enabled", value)
                  }
                />
              </SettingRow>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Select
                  value={testRecapProvider}
                  onValueChange={(value) =>
                    setTestRecapProvider(value as RecapProvider)
                  }
                  disabled={!data.recap.enabled}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="TELEGRAM" disabled={!data.telegram.configured}>
                      Telegram
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  disabled={
                    !data.recap.enabled ||
                    testRecap.isPending ||
                    (testRecapProvider === "TELEGRAM" && !data.telegram.configured)
                  }
                  onClick={() => testRecap.mutate(testRecapProvider)}
                >
                  {testRecap.isPending ? "Sending..." : "Send test recap"}
                </Button>
              </div>
              {testRecap.isError && (
                <ErrorMessage
                  message={getApiErrorMessage(testRecap.error)}
                  className="mt-3"
                />
              )}
              {testRecap.isSuccess && (
                <p className="mb-0 mt-3 text-xs text-emerald-600">
                  Test recap sent.
                </p>
              )}
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
                    ? `Connected to chat ${data.telegram.maskedChatId ?? ""}. Recaps can be sent here.`
                    : "Link a Telegram bot so the app can message your daily recap to you."}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="m-0 list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
                <li>
                  In Telegram, open <span className="font-medium">@BotFather</span>,
                  send <span className="font-medium">/newbot</span>, and copy the
                  bot token it gives you.
                </li>
                <li>
                  Send any message to your new bot, then open{" "}
                  <span className="font-medium">@userinfobot</span> to get your
                  numeric Chat ID.
                </li>
                <li>Paste both below and click Save Telegram.</li>
              </ol>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Bot token</Label>
                  <Input
                    type="password"
                    placeholder="123456:ABC-DEF..."
                    value={botToken}
                    onChange={(event) => setBotToken(event.target.value)}
                  />
                  <p className="m-0 text-[11px] text-muted-foreground">
                    From @BotFather. Kept private on this device.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Chat ID</Label>
                  <Input
                    placeholder="e.g. 987654321"
                    value={chatId}
                    onChange={(event) => setChatId(event.target.value)}
                  />
                  <p className="m-0 text-[11px] text-muted-foreground">
                    The chat where recaps are delivered.
                  </p>
                </div>
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
                  Global keyboard shortcuts to search or create without opening the app.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                <span>
                  <span className="block text-sm">Quick Search</span>
                  <span className="text-xs text-muted-foreground">
                    Click to change, then press the new keys.
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <ShortcutStatus active={shortcuts.registered.search} />
                  <button
                    type="button"
                    aria-label="Change Quick Search shortcut"
                    onClick={() => openRecorder("search")}
                    className="rounded-lg border bg-background px-3 py-1.5 text-xs hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {displayShortcut(shortcuts.shortcuts.search)}
                  </button>
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                <span>
                  <span className="block text-sm">Quick Create</span>
                  <span className="text-xs text-muted-foreground">
                    Click to change, then press the new keys.
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <ShortcutStatus active={shortcuts.registered.create} />
                  <button
                    type="button"
                    aria-label="Change Quick Create shortcut"
                    onClick={() => openRecorder("create")}
                    className="rounded-lg border bg-background px-3 py-1.5 text-xs hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {displayShortcut(shortcuts.shortcuts.create)}
                  </button>
                </span>
              </div>
              {!!shortcutError && (
                <p className="m-0 text-xs text-destructive">{shortcutError}</p>
              )}
              {!!shortcutNotice && (
                <p className="m-0 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {shortcutNotice}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Combine {isMac() ? "\u2318 Cmd, \u2325 Option," : "Ctrl, Alt,"} or Shift with one other key.
                  Some combos may be reserved by the OS.
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={resetShortcuts}>
                  Reset to defaults
                </Button>
              </div>
            </CardContent>
          </Card>
          <Dialog
            open={Boolean(recordingShortcut)}
            onOpenChange={(open) => {
              if (!open) closeRecorder();
            }}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {recordingShortcut === "create"
                    ? "Quick Create shortcut"
                    : "Quick Search shortcut"}
                </DialogTitle>
                <DialogDescription>
                  Press the keys you want, then click Save. Esc cancels.
                </DialogDescription>
              </DialogHeader>

              <button
                type="button"
                autoFocus
                onKeyDown={captureShortcut}
                onKeyUp={clearLiveOnRelease}
                onBlur={() => !pendingShortcut && setLivePreview("")}
                className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted/40 text-center outline-none transition-colors focus:border-primary focus:bg-accent/40"
              >
                {saving ? (
                  <span className="text-sm text-muted-foreground">Saving...</span>
                ) : pendingShortcut ? (
                  <span className="text-2xl font-medium tracking-wide">
                    {displayShortcut(pendingShortcut)}
                  </span>
                ) : livePreview ? (
                  <span className="text-2xl font-medium tracking-wide text-muted-foreground">
                    {livePreview}
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">
                      Press keys now
                    </span>
                    <span className="text-xs text-muted-foreground">
                      e.g. {isMac() ? "\u2318 \u2325 Space" : "Ctrl + Alt + Space"}
                    </span>
                  </>
                )}
              </button>

              {!!shortcutError && (
                <p className="m-0 text-center text-xs text-destructive">
                  {shortcutError}
                </p>
              )}
              <p className="m-0 text-center text-xs text-muted-foreground">
                {pendingShortcut
                  ? "Press Save to apply, or press new keys to change it."
                  : "Hold your modifiers and press a key."}
              </p>

              <div className="mt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeRecorder}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    recordingShortcut &&
                    pendingShortcut &&
                    void saveShortcut(recordingShortcut, pendingShortcut)
                  }
                  disabled={saving || !pendingShortcut}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
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
                  Clear your saved search history.
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
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
