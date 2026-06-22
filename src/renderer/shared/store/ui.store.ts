import { create } from 'zustand';

type UiState = {
  sidebarOpen: boolean;
  activityOpen: boolean;
  selectedNoteId?: string;
  toggleSidebar: () => void;
  toggleActivity: () => void;
  setActivityOpen: (open: boolean) => void;
  selectNote: (id?: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  activityOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleActivity: () => set((state) => ({ activityOpen: !state.activityOpen })),
  setActivityOpen: (activityOpen) => set({ activityOpen }),
  selectNote: (selectedNoteId) => set({ selectedNoteId }),
}));
