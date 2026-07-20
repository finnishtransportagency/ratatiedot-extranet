import { create } from 'zustand';
import { ExtOperationalPoint, ExtTrackNumber } from './types';

type DataFetchState = 'idle' | 'loading' | 'ready' | 'error';

export interface CommonDataState {
  trackNumbers: ExtTrackNumber[];
  operationalPoints: ExtOperationalPoint[];
  error: string | null;
  trackNumberStatus: DataFetchState | null;
  operationalPointsStatus: DataFetchState | null;

  setTrackNumbers: (trackNumbers: ExtTrackNumber[]) => void;
  setOperationalPoints: (operationalPoints: ExtOperationalPoint[]) => void;
  setError: (error: string | null) => void;
  fetchTrackNumbers: () => Promise<void>;
  fetchOperationalPoints: () => Promise<void>;
}

const fetchCommonData = async <T extends object>(target: string): Promise<{ data: T[] }> => {
  try {
    const queryString = new URLSearchParams({ endpoint: target }).toString();
    const url = `/api/geoviite/common?${queryString}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Error fetching ${target}:`, await response.text());
      throw new Error('Geoviite datan haku epäonnistui');
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error('Error fetching common data:', error);
    throw new Error('Geoviite datan haku epäonnistui');
  }
};

export const useCommonDataStore = create<CommonDataState>((set) => ({
  // Initial State
  trackNumbers: [],
  operationalPoints: [],
  error: null,
  trackNumberStatus: 'idle',
  operationalPointsStatus: 'idle',

  // Actions
  setTrackNumbers: (trackNumbers) =>
    set({
      trackNumbers,
    }),
  setOperationalPoints: (operationalPoints) =>
    set({
      operationalPoints,
    }),
  setError: (error) => set({ error }),

  fetchTrackNumbers: async () => {
    set({
      trackNumberStatus: 'loading',
    });
    try {
      const result = await fetchCommonData<ExtTrackNumber>('tracknumbers');
      set({
        trackNumbers: result.data,
        trackNumberStatus: 'ready',
        error: null,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message });
      }
    }
  },

  fetchOperationalPoints: async () => {
    set({
      operationalPointsStatus: 'loading',
    });
    try {
      const result = await fetchCommonData<ExtOperationalPoint>('operationalpoints');
      set({
        operationalPoints: result.data,
        operationalPointsStatus: 'ready',
        error: null,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message });
      }
    }
  },
}));
