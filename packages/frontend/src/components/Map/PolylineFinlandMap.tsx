import { useEffect, useRef } from 'react';
import L, { Layer } from 'leaflet';
import styled from '@emotion/styled';
import { useLocation, useNavigate } from 'react-router-dom';

import { findAreaId, loadGeoJson, polygonStyle } from '../../utils/mapUtil';
import { FinlandMapFeature } from './types';
import { StaticAreaFolderList } from '../Folders/StaticAreaFolderList';

type PolylineProps = {
  categoryId: string;
};

export const PolylineFinlandMap = ({ categoryId }: PolylineProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const initializeMap = async () => {
      try {
        if (!mapRef.current) {
          const map = L.map('map', {
            renderer: L.canvas({ tolerance: 6 }),
            scrollWheelZoom: true,
          }).setView([65, 26], 5);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          mapRef.current = map;
        }
        const geoJSONUrl = '/ratatiedot_kunnossapitoalueet_WGS84.json';
        const geoJsonData = await loadGeoJson(geoJSONUrl);

        L.geoJSON(geoJsonData, {
          style: polygonStyle as L.PathOptions,
          onEachFeature: (feature: FinlandMapFeature, layer: Layer) => {
            layer.on('click', () => {
              navigate(`${pathname}/${findAreaId(categoryId, feature.properties.kpalue)}`);
            });
          },
        }).addTo(mapRef.current);
      } catch (error) {
        console.log('Error initializing map:', error);
      }
    };

    initializeMap();
  }, []);

  return (
    <PolylineFinlandMapWrapper>
      <MapContainerWrapper id="map" />
      <StaticAreaFolderList categoryId={categoryId} />
    </PolylineFinlandMapWrapper>
  );
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
    width: '48%',
  },
}));

const PolylineFinlandMapWrapper = styled('div')(({ theme }) => ({
  [theme.breakpoints.only('desktop')]: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));
