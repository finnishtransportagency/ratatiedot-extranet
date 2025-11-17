import { create } from 'zustand';
import type { Section } from '../pages/Balise/types';

export interface SectionState {
  sections: Section[];
  error: string | null;
  fetchSections: () => Promise<void>;
}

const fetchSectionsAPI = async (): Promise<Section[]> => {
  const response = await fetch('/api/balise/sections');
  if (!response.ok) {
    throw new Error(`Failed to fetch sections: ${response.status}`);
  }
  return response.json();
};

export const useSectionStore = create<SectionState>()((set) => ({
  sections: [],
  error: null,
  fetchSections: async () => {
    try {
      const sections = await fetchSectionsAPI();
      set({ sections, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sections';
      set({ error: errorMessage });
      console.error(error);
    }
  },
}));
