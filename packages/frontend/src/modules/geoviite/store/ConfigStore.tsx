import { create } from 'zustand';

// How the displayed track spans are chosen: by picking a track number and its location
// tracks by hand, or by routing between two operational points.
export type SelectionMode = 'trackNumber' | 'route';

export interface ConfigState {
  mode: SelectionMode;

  setMode: (mode: SelectionMode) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  // Initial State
  mode: 'trackNumber',

  setMode: (mode: SelectionMode) =>
    set({
      mode: mode,
    }),
}));
