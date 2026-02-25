import { create } from 'zustand';
import type { Section } from '../types/baliseTypes';

export interface SectionState {
  sections: Section[];
  error: string | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  fetchSections: () => Promise<void>;
  createSection: (
    section: Omit<Section, 'id' | 'createdBy' | 'createdTime' | 'updatedBy' | 'updatedTime' | 'active'>,
  ) => Promise<Section>;
  updateSection: (
    id: string,
    section: Partial<
      Omit<Section, 'id' | 'createdBy' | 'createdTime' | 'updatedBy' | 'updatedTime' | 'key' | 'active'>
    >,
  ) => Promise<Section>;
  deleteSection: (id: string) => Promise<void>;
}

const fetchSectionsAPI = async (): Promise<Section[]> => {
  const response = await fetch('/api/balise/sections');
  if (!response.ok) {
    throw new Error(`Failed to fetch sections: ${response.status}`);
  }
  return response.json();
};

const createSectionAPI = async (
  section: Omit<Section, 'id' | 'createdBy' | 'createdTime' | 'updatedBy' | 'updatedTime' | 'active'>,
): Promise<Section> => {
  const response = await fetch('/api/balise/sections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(section),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to create section: ${response.status}`);
  }
  return response.json();
};

const updateSectionAPI = async (
  id: string,
  section: Partial<Omit<Section, 'id' | 'createdBy' | 'createdTime' | 'updatedBy' | 'updatedTime' | 'key' | 'active'>>,
): Promise<Section> => {
  const response = await fetch(`/api/balise/sections/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(section),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to update section: ${response.status}`);
  }
  return response.json();
};

const deleteSectionAPI = async (id: string): Promise<void> => {
  const response = await fetch(`/api/balise/sections/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to delete section: ${response.status}`);
  }
};

export const useSectionStore = create<SectionState>()((set, get) => ({
  sections: [],
  error: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  fetchSections: async () => {
    set({ isLoading: true, error: null });
    try {
      const sections = await fetchSectionsAPI();
      set({ sections, error: null, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sections';
      set({ error: errorMessage, isLoading: false });
      console.error(error);
    }
  },
  createSection: async (section) => {
    set({ isCreating: true, error: null });
    try {
      const newSection = await createSectionAPI(section);
      const { sections } = get();
      set({ sections: [...sections, newSection], error: null, isCreating: false });
      return newSection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create section';
      set({ error: errorMessage, isCreating: false });
      console.error(error);
      throw error;
    }
  },
  updateSection: async (id, section) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedSection = await updateSectionAPI(id, section);
      const { sections } = get();
      const updatedSections = sections.map((s) => (s.id === id ? updatedSection : s));
      set({ sections: updatedSections, error: null, isUpdating: false });
      return updatedSection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update section';
      set({ error: errorMessage, isUpdating: false });
      console.error(error);
      throw error;
    }
  },
  deleteSection: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await deleteSectionAPI(id);
      const { sections } = get();
      const updatedSections = sections.filter((s) => s.id !== id);
      set({ sections: updatedSections, error: null, isDeleting: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete section';
      set({ error: errorMessage, isDeleting: false });
      console.error(error);
      throw error;
    }
  },
}));
