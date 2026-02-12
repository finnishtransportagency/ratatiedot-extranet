import React from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface DeleteBaliseDialogProps {
  open: boolean;
  secondaryId?: number;
  loading?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog for deleting a single balise.
 * Contains standardized Finnish text explaining what happens during deletion.
 */
export const DeleteBaliseDialog: React.FC<DeleteBaliseDialogProps> = ({
  open,
  secondaryId,
  loading = false,
  disabled = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <ConfirmDialog
      open={open}
      title="Poista baliisi"
      message={
        <>
          Haluatko varmasti poistaa tämän baliisin (ID: {secondaryId})?
          <br />
          <br />
          <strong>Mitä tapahtuu:</strong>
          <br />
          • Baliisi poistetaan aktiivisesta käytöstä ja siirretään arkistoon
          <br />• Tunniste (ID {secondaryId}) vapautuu välittömästi uudelleenkäyttöön
          <br />
          • Kaikki versiot ja tiedostot säilyvät arkistossa
          <br />
          • Tiedostot siirretään arkistointipolkuun turvallisesti
          <br />
          <br />
          Poistettua baliisia ei voi palauttaa käyttöön.
        </>
      }
      confirmText="Poista"
      confirmColor="error"
      cancelText="Peruuta"
      disabled={disabled}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default DeleteBaliseDialog;
