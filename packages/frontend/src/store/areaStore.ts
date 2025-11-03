import { create } from 'zustand';
import type { Area } from '../pages/Balise/types';

export interface AreaState {
  areas: Area[];
  error: string | null;
  fetchAreas: () => Promise<void>;
}

const fetchAreasAPI = async (): Promise<Area[]> => {
  const response = await fetch('/api/balise/areas');
  if (!response.ok) {
    throw new Error(`Failed to fetch areas: ${response.status}`);
  }
  return response.json();
};

export const useAreaStore = create<AreaState>()((set) => ({
  areas: [],
  error: null,
  fetchAreas: async () => {
    try {
      const areas = await fetchAreasAPI();
      set({ areas, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch areas';
      set({ error: errorMessage });
      console.error(error);
    }
  },
}));
