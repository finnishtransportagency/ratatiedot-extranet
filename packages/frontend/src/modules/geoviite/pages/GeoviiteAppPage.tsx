import React from 'react';

import { useTranslation } from 'react-i18next';
import { TrackNumberSelect } from '../components/track-number-select';
import { AddressRangeInputs } from '../components/address-range-inputs';
import { LocationTrackList } from '../components/location-track-list';
import { RouteSelect } from '../components/route-select';
import { DiagramContainer } from '../components/diagram-container';
import { SelectionMode } from '../store/ConfigStore';
import { useConfigStore } from '../store/ConfigStore';
import { useCommonDataStore } from '../store/CommonDataStore';
import './styles.css';

// Chooses between the two ways of picking the displayed track spans: by track number
// and address range, or by routing between two operational points.
const SelectionModeToggle: React.FC = () => {
  const { t } = useTranslation(['geoviite']);
  const { mode, setMode } = useConfigStore();
  const modes: SelectionMode[] = ['trackNumber', 'route'];
  return (
    <div className="selection-mode-toggle">
      {modes.map((option) => (
        <label key={option}>
          <input type="radio" name="selection-mode" checked={mode === option} onChange={() => setMode(option)} />{' '}
          {t(option === 'trackNumber' ? 'selectionModeTrackNumber' : 'selectionModeRoute')}
        </label>
      ))}
    </div>
  );
};

export const GeoviiteAppPage: React.FC = () => {
  const { t } = useTranslation(['geoviite']);
  const { fetchTrackNumbers, fetchOperationalPoints } = useCommonDataStore();
  const { mode } = useConfigStore();

  // Load the track numbers and operational points on startup, and again whenever the
  // API config changes (committing a config change resets all loaded data).
  React.useEffect(() => {
    fetchTrackNumbers();
    fetchOperationalPoints();
  }, []);

  return (
    <div className="app">
      <h1>{t('title')}</h1>
      <div className="main-row">
        <section className="box diagram-box">
          <h2 className="box__heading">{t('boxDiagram')}</h2>
          <DiagramContainer />
        </section>
        <section className="box selection-box">
          <h2 className="box__heading">{t('boxTrackSelection')}</h2>
          <SelectionModeToggle />
          {mode === 'trackNumber' ? (
            <>
              <TrackNumberSelect />
              <div className="selection-row">
                <AddressRangeInputs />
              </div>
              <LocationTrackList />
            </>
          ) : (
            <RouteSelect />
          )}
        </section>
      </div>
    </div>
  );
};
