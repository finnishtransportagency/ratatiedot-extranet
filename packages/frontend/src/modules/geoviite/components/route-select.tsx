import React from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, FilterOptionsState, TextField } from '@mui/material';
import { ExtOperationalPoint } from '../store/types';
import { useCommonDataStore } from '../store/CommonDataStore';
import { useSelectionStore } from '../store/SelectionStore';
import { RouteRequest, routeRequestKey, useQueryDataStore } from '../store/QueryDataStore';

// Route-mode selection UI: the user picks the route's start and end operational
// points, and the routing API finds the location tracks between them.

interface OperationalPointOption {
  value: string;
  point: ExtOperationalPoint;
}

const toOption = (point: ExtOperationalPoint): OperationalPointOption => ({
  value: point.toiminnallinen_piste_oid,
  point,
});

const optionLabel = (option: OperationalPointOption) =>
  option.point.lyhenne ? `${option.point.nimi} (${option.point.lyhenne})` : option.point.nimi;

const optionMatches = (options: OperationalPointOption[], state: FilterOptionsState<OperationalPointOption>) => {
  const input = state.inputValue.trim().toLowerCase();

  if (!input) {
    return options;
  }

  return options.filter((option) => {
    const point = option.point;

    return (
      point.nimi.toLowerCase().includes(input) ||
      (point.lyhenne ?? '').toLowerCase().includes(input) ||
      point.toiminnallinen_piste_oid.toLowerCase().includes(input)
    );
  });
};

const OperationalPointSelect: React.FC<{
  options: OperationalPointOption[];
  selectedOid?: string;
  placeholder: string;
  isLoading: boolean;
  onChange: (oid: string | undefined) => void;
}> = ({ options, selectedOid, placeholder, isLoading, onChange }) => {
  const selectedOption = options.find((option) => option.value === selectedOid) ?? null;

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      loading={isLoading}
      clearOnEscape
      getOptionLabel={optionLabel}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      filterOptions={(options, state) => optionMatches(options, state)}
      onChange={(_, option) => onChange(option?.value)}
      renderInput={(params) => <TextField {...params} label={placeholder} />}
    />
  );
};

export const RouteSelect: React.FC = () => {
  const { t } = useTranslation(['geoviite']);
  const { operationalPoints, operationalPointsStatus } = useCommonDataStore();
  const { route, fetchRoute } = useQueryDataStore();
  const { routeStartOid, routeEndOid, routeStartSet, routeEndSet, routeEndpointsSwapped } = useSelectionStore();

  // Only operational points with a map location can bound a route: the routing API is
  // called with the points' coordinates.
  const points = React.useMemo(() => (operationalPoints ?? []).filter((point) => point.sijainti), [operationalPoints]);
  const options = React.useMemo(() => points.map(toOption), [points]);

  const startPoint = points.find((point) => point.toiminnallinen_piste_oid === routeStartOid);
  const endPoint = points.find((point) => point.toiminnallinen_piste_oid === routeEndOid);

  // Fetch the route whenever both endpoints are chosen and the current route state is
  // for some other request (or for none, after a data reset).
  React.useEffect(() => {
    if (!startPoint?.sijainti || !endPoint?.sijainti) {
      return;
    }
    const request: RouteRequest = {
      start: startPoint.sijainti,
      end: endPoint.sijainti,
    };
    if (route.status === 'idle' || route.key !== routeRequestKey(request)) {
      fetchRoute(request);
    }
  }, [startPoint, endPoint, route.status, route.key]);

  const summary = route.status === 'ready' && route.data && (
    <div className="hint-text">
      {t('routeSummary', {
        lengthKm: (route.data.reitti.pituus / 1000).toFixed(1),
        sections: route.data.reitti.reitin_osat.length,
        tracks: new Set(route.data.reitti.reitin_osat.map((section) => section.sijaintiraide_oid)).size,
      })}
    </div>
  );

  return (
    <div className="route-select">
      <OperationalPointSelect
        options={options}
        selectedOid={routeStartOid ?? ''}
        placeholder={t('routeStartPoint')}
        isLoading={operationalPointsStatus === 'loading'}
        onChange={(oid) => routeStartSet(oid)}
      />
      <OperationalPointSelect
        options={options}
        selectedOid={routeEndOid ?? ''}
        placeholder={t('routeEndPoint')}
        isLoading={operationalPointsStatus === 'loading'}
        onChange={(oid) => routeEndSet(oid)}
      />
      <div className="route-select__status">
        <button type="button" disabled={!routeStartOid && !routeEndOid} onClick={() => routeEndpointsSwapped()}>
          {t('swapRouteEndpoints')}
        </button>
        {route.status === 'loading' && <span className="hint-text">{t('loadingRoute')}</span>}
        {route.status === 'error' && (
          <span className="error-text">{t('failedToLoadRoute', { error: route.error })}</span>
        )}
        {route.status === 'ready' && route.data === null && <span className="hint-text">{t('noRouteFound')}</span>}
      </div>
      {summary}
    </div>
  );
};
