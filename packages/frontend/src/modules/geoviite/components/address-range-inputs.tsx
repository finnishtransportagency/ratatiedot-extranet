import React from 'react';
import { useTranslation } from 'react-i18next';
import { parseTrackAddress } from '../math/track-address';
import { useSelectionStore } from '../store/SelectionStore';

const AddressInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  const valid = value === '' || parseTrackAddress(value) !== undefined;
  return (
    <label>
      {label}{' '}
      <input
        type="text"
        size={13}
        className={valid ? '' : 'input-invalid'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0000+0000.000"
      />
    </label>
  );
};

export const AddressRangeInputs: React.FC = () => {
  const { t } = useTranslation(['geoviite']);
  const { addressStart, addressEnd, addressStartSet, addressEndSet } = useSelectionStore();

  return (
    <div className="address-range-inputs">
      <AddressInput label={t('addressRangeStart')} value={addressStart} onChange={(value) => addressStartSet(value)} />
      <AddressInput label={t('addressRangeEnd')} value={addressEnd} onChange={(value) => addressEndSet(value)} />
    </div>
  );
};
