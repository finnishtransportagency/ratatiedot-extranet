import { create } from 'zustand';
import { ExtLocationTrack, ExtRouteResponse, LocationTrackResponse } from './types';

export interface AsyncData<T> {
  status: 'idle' | 'loading' | 'ready' | 'error';
  data?: T;
  error?: string;
}

export interface RouteRequest {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export interface QueryDateState {
  trackNumberTracks: AsyncData<ExtLocationTrack[]> & {
    trackNumberOid?: string;
  };
  // The latest requested route; data is null when the API found no route between the
  // given locations (204). `key` identifies the request (see routeRequestKey) so a
  // stale response cannot overwrite a newer request's state.
  route: AsyncData<ExtRouteResponse | null> & { key?: string };
  locationTracks: AsyncData<LocationTrackResponse | null>;
  fetchTrackNumberTracks: (trackNumberOid: string) => Promise<void>;
  fetchLocationTrack: (locationTrackOid: string) => Promise<void>;
  fetchRoute: (request: RouteRequest) => Promise<void>;
}

export function routeRequestKey(request: RouteRequest): string {
  return `${request.start.x},${request.start.y}->${request.end.x},${request.end.y}`;
}

const fetchTrackNumberTracksApi = async (trackNumberOid: string) => {
  try {
    const queryString = new URLSearchParams({ rail_oid: trackNumberOid }).toString();
    const url = `/api/geoviite/locationtracks?${queryString}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching trackNumberOid:, ${await response.text()}`);
    }
    const result = await response.json();

    return result.sijaintiraiteet;
  } catch (error) {
    throw new Error(`Error fetching trackNumberOid:, ${error}`);
  }
};

const fetchLocationTrackApi = async (locationTrackOid: string) => {
  try {
    const queryString = new URLSearchParams({ rail_oid: encodeURIComponent(locationTrackOid) }).toString();
    const url = `/api/geoviite/locationtracks/one?${queryString}`;
    const info = await fetch(url);
    if (!info.ok) {
      throw new Error(`Error fetching locationTrackOid:, ${await info.text()}`);
    }
    const parsedInfo = await info.json();

    const geometryQueryString = new URLSearchParams({ oid: locationTrackOid, endpoint: 'geometria' }).toString();
    const geometryUrl = `/api/geoviite/locationtracks/geometry?${geometryQueryString}`;
    // { osoitepistevali: '10' },
    const geometry = await fetch(geometryUrl);
    if (!geometry.ok) {
      throw new Error(`Error fetching geometry:, ${await info.text()}`);
    }
    const parsedGeometry = await geometry.json();

    const profileQueryString = new URLSearchParams({
      oid: locationTrackOid,
      endpoint: 'pystygeometria',
    }).toString();
    const profileGeometryUrl = `/api/geoviite/locationtracks/geometry?${profileQueryString}`;
    const profile = await fetch(profileGeometryUrl);
    if (!profile.ok) {
      throw new Error(`Error fetching vertical geometry:, ${await info.text()}`);
    }
    const parsedProfile = await profile.json();

    return {
      info: parsedInfo.sijaintiraide,
      profile: parsedProfile,
      geometry: parsedGeometry,
    };
  } catch (error) {
    throw new Error(`Error fetching locationTrackOid:, ${error}`);
  }
};

const fetchRouteApi = async (request: RouteRequest) => {
  try {
    const queryString = new URLSearchParams({
      sijainti_alku_x: String(request.start.x),
      sijainti_alku_y: String(request.start.y),
      sijainti_loppu_x: String(request.end.x),
      sijainti_loppu_y: String(request.end.y),
    }).toString();

    const url = `/api/geoviite/routing?${queryString}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching trackNumberOid:, ${await response.text()}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching route:, ${error}`);
  }
};

export const useQueryDataStore = create<QueryDateState>((set) => ({
  // Initial State
  trackNumberTracks: {
    status: 'idle',
    data: [],
  },
  route: {
    status: 'idle',
    data: null,
  },
  locationTracks: {
    status: 'idle',
  },
  fetchTrackNumberTracks: async (oid: string) => {
    set((state) => ({
      trackNumberTracks: {
        status: 'loading',
        data: state.trackNumberTracks.data,
      },
    }));

    try {
      const data = await fetchTrackNumberTracksApi(oid);
      set(() => ({
        trackNumberTracks: {
          status: 'ready',
          data: data,
        },
      }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      set((state) => ({
        trackNumberTracks: {
          status: 'error',
          data: state.trackNumberTracks.data,
        },
      }));
    }
  },
  fetchLocationTrack: async (oid: string) => {
    set(() => ({
      locationTracks: {
        status: 'loading',
      },
    }));
    try {
      const data = await fetchLocationTrackApi(oid);
      set(() => ({
        locationTracks: {
          status: 'ready',
          data: data,
        },
      }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      set(() => ({
        locationTracks: {
          status: 'loading',
        },
      }));
    }
  },
  fetchRoute: async (request: RouteRequest) => {
    set((state) => ({
      route: {
        status: 'loading',
        data: state.route.data,
      },
    }));

    try {
      const data = await fetchRouteApi(request);
      set(() => ({
        route: {
          status: 'ready',
          data: data,
        },
      }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      set((state) => ({
        route: {
          status: 'error',
          data: state.route.data,
        },
      }));
    }
  },
}));
