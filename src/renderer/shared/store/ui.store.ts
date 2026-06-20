import { create } from 'zustand';

type UiState = {
  sidebarOpen: boolean;
  activityOpen: boolean;
  selectedNoteId?: string;
  toggleSidebar: () => void;
  toggleActivity: () => void;
  selectNote: (id?: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  activityOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleActivity: () => set((state) => ({ activityOpen: !state.activityOpen })),
  selectNote: (selectedNoteId) => set({ selectedNoteId }),
}));
