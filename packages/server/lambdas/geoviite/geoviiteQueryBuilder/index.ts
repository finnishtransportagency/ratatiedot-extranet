interface GeoViiteEndpointProps {
  trackNumbers: string;
  operationalPoints: string;
  locationTracks: string;
}
export const geoviiteEndpoints: GeoViiteEndpointProps = {
  trackNumbers: '/paikannuspohja/v1/ratanumerot',
  operationalPoints: '/paikannuspohja/v1/toiminnalliset-pisteet',
  locationTracks: '/paikannuspohja/v1/sijaintiraiteet',
};
