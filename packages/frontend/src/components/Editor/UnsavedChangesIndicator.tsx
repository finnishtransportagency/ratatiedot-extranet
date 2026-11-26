import { Typography } from '@mui/material';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Colors } from '../../constants/Colors';
import { EditorContext } from '../../contexts/EditorContext';
import { countChangedTopLevelNodes } from '../../utils/slateEditorUtil';

export const UnsavedChangesIndicator = () => {
  const { t } = useTranslation(['common']);
  const { value, savedValue } = useContext(EditorContext);
  const count = useMemo(() => countChangedTopLevelNodes(value, savedValue), [value, savedValue]);

  return (
    <Typography variant="caption" sx={{ color: Colors.darkgrey }}>
      {t('common:edit.unsaved_changes_count', { count })}
    </Typography>
  );
};
