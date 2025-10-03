import { create } from 'zustand';
import type { Balise, BaliseVersion, BaliseWithHistory } from '../pages/Balise/types';

// Re-export for components that import from store
export type { BaliseWithHistory };

export interface BaliseFilters {
  id_min?: number;
  id_max?: number;
  page?: number;
  limit?: number;
  include_history?: boolean;
}

export interface BaliseState {
  // Data
  balises: BaliseWithHistory[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;

  // Loading states
  isInitialLoading: boolean;
  isBackgroundLoading: boolean;
  error: string | null;

  // Cache management
  lastFetched: number | null;
  currentFilters: BaliseFilters | null;

  // Actions
  setBalises: (balises: BaliseWithHistory[], pagination?: any) => void;
  updateBalise: (balise: BaliseWithHistory) => void;
  setInitialLoading: (loading: boolean) => void;
  setBackgroundLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchBalises: (filters?: BaliseFilters, background?: boolean) => Promise<void>;
  loadMoreBalises: (filters?: BaliseFilters) => Promise<void>;
  refreshBalise: (secondaryId: number) => Promise<void>;
  clearCache: () => void;
}

// API function
const fetchBaliseAPI = async (filters?: BaliseFilters): Promise<{ data: BaliseWithHistory[]; pagination: any }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.id_min) params.append('id_min', filters.id_min.toString());
    if (filters?.id_max) params.append('id_max', filters.id_max.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.include_history) params.append('include_history', 'true');
    const queryString = params.toString();
    const url = `http://localhost:3002/api/balises${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle both paginated and non-paginated responses
    if (result.data && result.pagination) {
      return {
        data: result.data.map((item: any) => ({
          ...item,
          history: item.history || [],
        })),
        pagination: result.pagination,
      };
    } else {
      return {
        data: result.map((item: any) => ({
          ...item,
          history: item.history || [],
        })),
        pagination: {
          page: 1,
          limit: result.length,
          totalCount: result.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching balises:', error);
    throw error;
  }
};

const fetchSingleBaliseAPI = async (secondaryId: number): Promise<BaliseWithHistory> => {
  const response = await fetch(`http://localhost:3002/api/balise/${secondaryId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch balise: ${response.status}`);
  }
  return response.json();
};

export const useBaliseStore = create<BaliseState>()((set, get) => ({
  // Initial state
  balises: [],
  pagination: null,
  isInitialLoading: false,
  isBackgroundLoading: false,
  error: null,
  lastFetched: null,
  currentFilters: null,

  // Actions
  setBalises: (balises, pagination) =>
    set({
      balises,
      pagination: pagination || null,
      lastFetched: Date.now(),
      error: null,
    }),

  updateBalise: (updatedBalise) =>
    set((state) => ({
      balises: state.balises.map((balise) =>
        balise.secondaryId === updatedBalise.secondaryId ? updatedBalise : balise,
      ),
    })),

  setInitialLoading: (loading) => set({ isInitialLoading: loading }),
  setBackgroundLoading: (loading) => set({ isBackgroundLoading: loading }),
  setError: (error) => set({ error }),

  fetchBalises: async (filters, background = false) => {
    // Set appropriate loading state
    if (background) {
      set({ isBackgroundLoading: true });
    } else {
      set({ isInitialLoading: true, error: null });
    }

    try {
      console.log('Fetching balises with filters:', filters);
      const result = await fetchBaliseAPI(filters);
      console.log('Fetched balises:', result.data.length, 'pagination:', result.pagination);

      set({
        balises: result.data,
        pagination: result.pagination,
        lastFetched: Date.now(),
        currentFilters: filters || null,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balises';
      set({ error: errorMessage });
    } finally {
      set({
        isInitialLoading: false,
        isBackgroundLoading: false,
      });
    }
  },

  loadMoreBalises: async (filters) => {
    const state = get();
    if (!state.pagination?.hasNextPage || state.isBackgroundLoading) {
      return; // No more data to load or already loading
    }

    set({ isBackgroundLoading: true });

    try {
      // Use current stored filters as the base, but allow override
      const baseFilters = state.currentFilters || {};
      const nextPageFilters = {
        ...baseFilters,
        ...filters, // Allow override of specific filters
        page: (state.pagination.page || 1) + 1,
        limit: state.pagination.limit || 200,
      };

      console.log('Loading more balises with filters:', nextPageFilters);
      const result = await fetchBaliseAPI(nextPageFilters);

      set((currentState) => ({
        balises: [...currentState.balises, ...result.data],
        pagination: result.pagination,
        lastFetched: Date.now(),
        currentFilters: nextPageFilters, // Update stored filters with new page
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load more balises';
      set({ error: errorMessage });
      console.error('Error loading more balises:', error);
    } finally {
      set({ isBackgroundLoading: false });
    }
  },

  refreshBalise: async (secondaryId) => {
    try {
      const updatedBalise = await fetchSingleBaliseAPI(secondaryId);
      get().updateBalise(updatedBalise);
    } catch (error) {
      console.error('Failed to refresh balise:', error);
      // Don't set global error for single balise refresh failures
    }
  },

  clearCache: () =>
    set({
      balises: [],
      pagination: null,
      lastFetched: null,
      currentFilters: null,
      error: null,
    }),
}));
