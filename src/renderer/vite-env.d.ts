/// <reference types="vite/client" />

declare global {
  interface Window { desktop?: {
    platform: string;
    closeQuickWindow: () => void;
    openQuickResult: (id: string) => void;
    saveQuickNote: (note: {title: string; content: string; categoryIds?: string[]; relatedIds?: string[]}) => void;
    onNavigate: (callback: (path: string) => void) => () => void;
  } }
}

export {};
