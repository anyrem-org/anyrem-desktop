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
    onNavigate: (callback: (path: string) => void) => () => void;
  } }
}

export {};
