interface GeoViiteEndpointProps {
  trackNumbers: string;
  operationalPoints: string;
  locationTracks: string;
}
const apiBase = '/paikannuspohja/v1';
export const geoviiteEndpoints: GeoViiteEndpointProps = {
  trackNumbers: `${apiBase}/ratanumerot`,
  operationalPoints: `${apiBase}/toiminnalliset-pisteet`,
  locationTracks: `${apiBase}/sijaintiraiteet`,
};
