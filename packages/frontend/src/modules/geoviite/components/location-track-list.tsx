import React from 'react';
import { useTranslation } from 'react-i18next';
import { parseTrackAddress } from '../math/track-address';
import { disabledLocationTrackOids, listedLocationTracks } from '../math/selection';
import { ExtLocationTrack, LocationTrackType, allLocationTrackTypes } from '../store/types';
import { useQueryDataStore } from '../store/QueryDataStore';
import { useSelectionStore } from '../store/SelectionStore';

const TrackRow: React.FC<{
  track: ExtLocationTrack;
  selected: boolean;
  disabled: boolean;
  onToggle: (oid: string) => void;
}> = React.memo(({ track, selected, disabled, onToggle }) => (
  <li className={disabled ? 'location-track-row location-track-row--disabled' : 'location-track-row'}>
    <label title={`${track.sijaintiraide_oid}\n${track.kuvaus}`}>
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={() => onToggle(track.sijaintiraide_oid)}
      />{' '}
      <span className="location-track-row__name">{track.sijaintiraidetunnus}</span>{' '}
      <span className="location-track-row__addresses">
        {track.alkusijainti?.rataosoite} – {track.loppusijainti?.rataosoite}
      </span>{' '}
      <span className="location-track-row__description">{track.kuvaus}</span>
    </label>
  </li>
));
TrackRow.displayName = 'TrackRow';

export const LocationTrackList: React.FC = () => {
  const { t } = useTranslation(['geoviite']);
  const { trackNumberTracks, locationTracks, fetchLocationTrack } = useQueryDataStore();
  const {
    addressStart,
    addressEnd,
    selectedLocationTrackOids,
    trackTypeFilter,
    trackTypeFilterToggled,
    locationTrackToggled,
  } = useSelectionStore();

  const selectedSet = React.useMemo(() => new Set(selectedLocationTrackOids), [selectedLocationTrackOids]);

  const range = React.useMemo(() => {
    const start = parseTrackAddress(addressStart);
    const end = parseTrackAddress(addressEnd);
    return start && end ? { start, end } : undefined;
  }, [addressStart, addressEnd]);

  const trackTypeFilterSet = React.useMemo(() => new Set(trackTypeFilter), [trackTypeFilter]);

  const listed = React.useMemo(
    () => listedLocationTracks(trackNumberTracks.data ?? [], range, selectedSet, trackTypeFilter),
    [trackNumberTracks.data, range, selectedSet, trackTypeFilter],
  );
  const disabled = React.useMemo(() => disabledLocationTrackOids(listed, selectedSet), [listed, selectedSet]);

  const onToggle = React.useCallback(
    (oid: string) => {
      locationTrackToggled(oid);
      const profile = locationTracks[oid];
      if (!profile || profile.status === 'error') {
        fetchLocationTrack(oid);
      }
    },
    [locationTracks],
  );

  const onToggleType = React.useCallback((type: LocationTrackType) => {
    trackTypeFilterToggled(type);
  }, []);

  if (trackNumberTracks.status === 'idle') {
    return <div className="hint-text">{t('selectTrackNumber')}</div>;
  }
  if (trackNumberTracks.status === 'loading') {
    return <div className="hint-text">{t('loadingLocationTracks')}</div>;
  }
  if (trackNumberTracks.status === 'error') {
    return <div className="error-text">{t('failedToLoadLocationTracks', { error: trackNumberTracks.error })}</div>;
  }

  return (
    <div className="location-track-list">
      <div className="track-type-filter">
        <span className="track-type-filter__label">{t('trackTypeFilter')}:</span>
        {allLocationTrackTypes.map((type) => (
          <label key={type} className="track-type-filter__option">
            <input type="checkbox" checked={trackTypeFilterSet.has(type)} onChange={() => onToggleType(type)} />{' '}
            {t(`trackType_${type}`)}
          </label>
        ))}
      </div>
      <div className="hint-text">
        {t('locationTracksInRange', {
          listed: listed.length,
          total: trackNumberTracks.data?.length ?? 0,
          selected: selectedLocationTrackOids.length,
        })}
      </div>
      <ul>
        {listed.map((track) => (
          <TrackRow
            key={track.sijaintiraide_oid}
            track={track}
            selected={selectedSet.has(track.sijaintiraide_oid)}
            disabled={disabled.has(track.sijaintiraide_oid)}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </div>
  );
};
