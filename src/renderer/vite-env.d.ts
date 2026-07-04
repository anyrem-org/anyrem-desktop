/// <reference types="vite/client" />

declare global {
  interface Window { desktop?: {
    platform: string;
    closeQuickWindow: () => void;
    openQuickResult: (id: string) => void;
    saveQuickNote: (note: {title: string; content: string; categoryIds?: string[]; relatedIds?: string[]}) => void;
    getRefreshToken: () => Promise<string | null>;
    setRefreshToken: (token: string) => Promise<void>;
    clearRefreshToken: () => Promise<void>;
    getShortcuts: () => Promise<ShortcutPayload>;
    setShortcut: (name: ShortcutName, accelerator: string) => Promise<ShortcutPayload & { ok: boolean; pending?: boolean }>;
    resetShortcuts: () => Promise<ShortcutPayload>;
    onNavigate: (callback: (path: string) => void) => () => void;
  } }
}

type ShortcutName = "search" | "create";
type ShortcutPayload = {
  shortcuts: Record<ShortcutName, string>;
  registered: Record<ShortcutName, boolean>;
};

export {};
