import styled from '@emotion/styled';
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';
import locationTrackData from '../../assets/data/locationtracks_simplifiedLineWSG84.json';

interface IMapData {
  id: string;
  from_lat: number;
  from_long: number;
  to_lat: number;
  to_long: number;
  color: string;
  isDashed?: boolean;
}

type PolylineFinlandMapProps = {
  coordinates: [number, number];
  zoom: number;
  // data: IMapData[];
};

export const PolylineFinlandMap = (props: PolylineFinlandMapProps) => {
  const { coordinates, zoom } = props;

  const polylines = locationTrackData.features.map((feature) => {
    const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const operating_ = feature.properties.operating_;
    return {
      coords,
      operating_,
    };
  });

  const polylineComponents = polylines.map(({ coords, operating_ }: any, index: any) => (
    <Polyline key={index} positions={coords} />
  ));
  return (
    <MapContainerWrapper center={coordinates} zoom={zoom} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {polylineComponents}
    </MapContainerWrapper>
  );
};

const MapContainerWrapper = styled(MapContainer)(({ theme }) => ({
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
