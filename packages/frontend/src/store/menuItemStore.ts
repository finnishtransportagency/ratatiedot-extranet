import { create } from 'zustand';

export interface MenuItemStore {
  openMenuItems: string[];
  addMenuItem: (id: string) => void;
  removeMenuItem: (id: string) => void;
  wipeMenuItems: () => void;
}

export const useMenuItemStore = create<MenuItemStore>()((set) => ({
  openMenuItems: [],
  addMenuItem: (id) => set((state) => ({ openMenuItems: [...state.openMenuItems, id] })),
  removeMenuItem: (id) => set((state) => ({ openMenuItems: state.openMenuItems.filter((item) => item !== id) })),
  wipeMenuItems: () => set({ openMenuItems: [] }),
}));
