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
    throw new Error('Rataosien haku epäonnistui');
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
    console.error('Failed to create section:', error);
    throw new Error('Rataosan lisäys epäonnistui');
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
    console.error('Failed to update section:', error);
    throw new Error('Rataosan päivitys epäonnistui');
  }
  return response.json();
};

const deleteSectionAPI = async (id: string): Promise<void> => {
  const response = await fetch(`/api/balise/sections/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to delete section:', error);
    throw new Error('Rataosan poisto epäonnistui');
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
      console.error('Failed to fetch sections:', error);
      const errorMessage = 'Rataosien haku epäonnistui';
      set({ error: errorMessage, isLoading: false });
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
      console.error('Failed to create section:', error);
      const errorMessage = 'Rataosan lisäys epäonnistui';
      set({ error: errorMessage, isCreating: false });
      throw new Error(errorMessage);
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
      console.error('Failed to update section:', error);
      const errorMessage = 'Rataosan päivitys epäonnistui';
      set({ error: errorMessage, isUpdating: false });
      throw new Error(errorMessage);
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
      console.error('Failed to delete section:', error);
      const errorMessage = 'Rataosan poisto epäonnistui';
      set({ error: errorMessage, isDeleting: false });
      throw new Error(errorMessage);
    }
  },
}));
