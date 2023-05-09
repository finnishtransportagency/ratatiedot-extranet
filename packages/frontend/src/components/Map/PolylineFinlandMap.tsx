import { useEffect, useRef } from 'react';
import L from 'leaflet';
import styled from '@emotion/styled';

import { loadGeoJson, polygonStyle } from '../../utils/mapUtil';

export const PolylineFinlandMap = () => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        if (!mapRef.current) {
          const map = L.map('map').setView([65, 26], 5);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          mapRef.current = map;
        }
        const geoJSONUrl = '/ratatiedot_kunnossapitoalueet_WGS84.json';
        const geoJsonData = await loadGeoJson(geoJSONUrl);

        L.geoJSON(geoJsonData, {
          style: polygonStyle as L.PathOptions,
        }).addTo(mapRef.current);
      } catch (error) {
        console.log('Error initializing map:', error);
      }
    };

    initializeMap();
  }, []);

  return <MapContainerWrapper id="map" />;
};

const MapContainerWrapper = styled('div')(({ theme }) => ({
  height: '80vh',
  [theme.breakpoints.only('mobile')]: {
    width: '90%',
  },
  [theme.breakpoints.only('tablet')]: {
    width: '95%',
  },
  [theme.breakpoints.only('desktop')]: {
    width: '40%',
  },
}));
