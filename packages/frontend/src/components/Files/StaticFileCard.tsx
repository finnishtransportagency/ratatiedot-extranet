import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import prettyBytes from 'pretty-bytes';
import { get } from 'lodash';

import { Colors } from '../../constants/Colors';
import { DateFormat } from '../../constants/Formats';
import { getLocaleByteUnit } from '../../utils/helpers';
import { LocaleLang } from '../../constants/Units';
import { TNode } from '../../types/types';
import { Styles } from '../../constants/Styles';
import { NodeTypes } from './File';

type NodeItemProps = {
  node: TNode;
};

export const StaticFileCard = ({ node }: NodeItemProps) => {
  const { id, name, modifiedAt, content } = node.entry;
  const contentMimeType = get(content, 'mimeType', '');
  const contentSizeInBytes = get(content, 'sizeInBytes', 0);

  const matchMimeType = (mimeType: string) => {
    const foundMimeType = Object.entries(NodeTypes).find(([key]) => mimeType.indexOf(key) !== -1);
    return foundMimeType ? foundMimeType[1] : NodeTypes.other;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        backgroundColor: Colors.lightgrey,
        textDecoration: 'none',
        margin: '8px 0',
        gap: '8px',
        padding: '8px',
        alignItems: 'flex-start',
        borderRadius: Styles.radius,
      }}
      component="a"
    >
      <Box sx={{ paddingTop: '4px' }} component="img" src={matchMimeType(contentMimeType)} alt="Logo" />
      <div style={{ display: 'flex', flexDirection: 'column', color: Colors.darkgrey }}>
        <Typography variant="body1" sx={{ color: Colors.extrablack }}>
          {name}
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <Typography variant="body1" sx={{ marginRight: '8px' }}>
            {format(new Date(modifiedAt), DateFormat)}
          </Typography>
          <Typography variant="body1" sx={{ marginRight: '8px' }}>
            {getLocaleByteUnit(prettyBytes(contentSizeInBytes, { locale: 'fi' }), LocaleLang.FI)}
          </Typography>
        </Box>
      </div>
    </Box>
  );
};
