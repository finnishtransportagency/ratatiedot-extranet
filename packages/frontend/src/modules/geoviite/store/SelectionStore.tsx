import { create } from 'zustand';
import { LocationTrackType } from './types';

interface SelectionType {
  oid: string;
  addressStart: string;
  addressEnd: string;
}

export interface SelectionState {
  trackNumberOid?: string;
  addressStart: string;
  addressEnd: string;
  selectedLocationTrackOids: string[];
  trackTypeFilter: LocationTrackType[];
  // Operational point oids bounding the route in route mode. Kept when switching
  // modes, so flipping back and forth does not lose either selection.
  routeStartOid: string | null;
  routeEndOid: string | null;

  trackNumberSelected: (selection: SelectionType) => void;
  addressStartSet: (value: string) => void;
  addressEndSet: (value: string) => void;
  trackTypeFilterToggled: (type: LocationTrackType) => void;
  locationTrackToggled: (oid: string) => void;
  routeStartSet: (oid: string | undefined) => void;
  routeEndSet: (oid: string | undefined) => void;
  routeEndpointsSwapped: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  // Initial State
  addressStart: '',
  addressEnd: '',
  selectedLocationTrackOids: [],
  trackTypeFilter: ['pääraide'],
  routeStartOid: null,
  routeEndOid: null,

  trackNumberSelected: (selection: SelectionType) => ({
    trackNumberOid: selection.oid,
    addressStart: selection.addressStart,
    addressEnd: selection.addressEnd,
    selectedLocationTrackOids: [],
  }),

  addressStartSet: (value: string) => ({
    addressStart: value,
  }),

  addressEndSet: (value: string) => ({
    addressEnd: value,
  }),

  trackTypeFilterToggled: (type: LocationTrackType) =>
    set((state) => ({
      trackTypeFilter: state.trackTypeFilter.includes(type)
        ? state.trackTypeFilter.filter((t) => t !== type)
        : state.trackTypeFilter.concat(type),
    })),

  locationTrackToggled: (oid: string) =>
    set((state) => ({
      selectedLocationTrackOids: state.selectedLocationTrackOids.includes(oid)
        ? state.selectedLocationTrackOids.filter((s) => s !== oid)
        : state.selectedLocationTrackOids.concat(oid),
    })),

  routeStartSet: (oid: string | undefined) => ({
    routeStartOid: oid ?? null,
  }),

  routeEndSet: (oid: string | undefined) => ({
    routeEndOid: oid ?? null,
  }),
  routeEndpointsSwapped: () =>
    set((state) => ({
      routeStartOid: state.routeEndOid,
      routeEndOid: state.routeStartOid,
    })),
}));
