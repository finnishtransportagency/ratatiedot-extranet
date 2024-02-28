import { create } from 'zustand';

type State = {
  refreshKey: number;
  incrementRefreshKey: () => void;
  resetRefreshKey: () => void;
};

export const useStore = create<State>((set) => ({
  refreshKey: 0,
  incrementRefreshKey: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  resetRefreshKey: () => set(() => ({ refreshKey: 0 })),
}));
