import { create } from 'zustand';
import { ViewRange } from '../math/layout';

interface ViewState {
  // null means "show the full extent of the displayed tracks"
  range: ViewRange | null;
  setViewRange: (newView: ViewRange) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  // Initial State
  range: null,

  setViewRange: (newRange: ViewRange) =>
    set({
      range: newRange,
    }),
}));
