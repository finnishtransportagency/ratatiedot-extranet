export interface GeoViiteEndpointProps {
  tracknumbers: string;
  operationalpoints: string;
  locationtracks: string;
}
const apiBase = '/paikannuspohja/v1';
export const geoviiteEndpoints: GeoViiteEndpointProps = {
  tracknumbers: `${apiBase}/ratanumerot`,
  operationalpoints: `${apiBase}/toiminnalliset-pisteet`,
  locationtracks: `${apiBase}/sijaintiraiteet`,
};
