import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtTrackNumber } from '../store/types';
import { useCommonDataStore } from '../store/CommonDataStore';
import { useSelectionStore } from '../store/SelectionStore';
import { useQueryDataStore } from '../store/QueryDataStore';
import { Autocomplete, FilterOptionsState, TextField } from '@mui/material';

interface TrackNumberOption {
  value: string;
  trackNumber: ExtTrackNumber;
}

const toOption = (trackNumber: ExtTrackNumber): TrackNumberOption => ({
  value: trackNumber.ratanumero_oid,
  trackNumber,
});

const optionLabel = (option: TrackNumberOption) =>
  `${option.trackNumber.ratanumero} — ${option.trackNumber.kuvaus} (${option.trackNumber.ratanumero_oid})`;

const optionMatches = (options: TrackNumberOption[], state: FilterOptionsState<TrackNumberOption>) => {
  const input = state.inputValue.trim().toLowerCase();
  if (!input) {
    return options;
  }

  return options.filter((option) => {
    const tn = option.trackNumber;

    return (
      tn.ratanumero_oid.toLowerCase().includes(input) ||
      tn.ratanumero.toLowerCase().includes(input) ||
      tn.kuvaus.toLowerCase().includes(input)
    );
  });
};

export const TrackNumberSelect: React.FC = () => {
  const { t } = useTranslation(['geoviite']);
  const { trackNumbers, trackNumberStatus, error } = useCommonDataStore();
  const { trackNumberOid, trackNumberSelected } = useSelectionStore();
  const { fetchTrackNumberTracks } = useQueryDataStore();

  const options = React.useMemo(() => (trackNumbers ?? []).map(toOption), [trackNumbers]);
  const selectedOption = options.find((option) => option.value === trackNumberOid) ?? null;

  return (
    <div className="track-number-select">
      <Autocomplete
        options={options}
        value={selectedOption}
        loading={trackNumberStatus === 'loading'}
        getOptionLabel={optionLabel}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        filterOptions={(options, state) => optionMatches(options, state)}
        onChange={(_, option) => {
          if (!option) {
            return;
          }

          const tn = option.trackNumber;

          trackNumberSelected({
            oid: tn.ratanumero_oid,
            addressStart: tn.alkusijainti?.rataosoite ?? '',
            addressEnd: tn.loppusijainti?.rataosoite ?? '',
          });
          fetchTrackNumberTracks(tn.ratanumero_oid);
        }}
        renderInput={(params) => (
          <TextField {...params} label={t('searchTrackNumber')} placeholder={t('searchTrackNumber')} />
        )}
      />

      {error === 'error' && <div className="error-text">{t('failedToLoadTrackNumbers', { error: error })}</div>}
    </div>
  );
};
