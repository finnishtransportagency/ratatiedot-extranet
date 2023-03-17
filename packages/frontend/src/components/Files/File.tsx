import { Box, Grid, Typography } from '@mui/material';
import { format } from 'date-fns';
import prettyBytes from 'pretty-bytes';
import { get } from 'lodash';

import Other from '../../assets/icons/Other.svg';
import Word from '../../assets/icons/Word.svg';
import Excel from '../../assets/icons/Excel.svg';
import PDF from '../../assets/icons/PDF.svg';
import PlainText from '../../assets/icons/PlainText.svg';
import Image from '../../assets/icons/Image.svg';
import PPT from '../../assets/icons/PowerPoint.svg';
import { Colors } from '../../constants/Colors';
import { DateFormat } from '../../constants/Formats';
import { getLocaleByteUnit } from '../../utils/helpers';
import { LocaleLang } from '../../constants/Units';
import { TNode } from '../../types/types';
import { useContext } from 'react';
import { AppBarContext } from '../../contexts/AppBarContext';

export const NodeTypes = {
  other: Other,
  document: Word,
  msword: Word,
  sheet: Excel,
  pdf: PDF,
  text: PlainText,
  image: Image,
  powerpoint: PPT,
  ppt: PPT,
};

type NodeItemProps = {
  node: TNode;
  row: number;
  isSelected?: boolean;
  isStatic?: boolean;
  onFileClick?: (node: TNode) => void;
};

export const NodeItem = ({
  node,
  row,
  onFileClick = () => {},
  isSelected = false,
  isStatic = false,
}: NodeItemProps) => {
  const { entry } = node;
  const { id, name, modifiedAt, content } = entry;
  const contentMimeType = get(content, 'mimeType', '');
  const contentSizeInBytes = get(content, 'sizeInBytes', 0);
  const { REACT_APP_ALFRESCO_DOWNLOAD_URL } = process.env;
  const { openEdit, openToolbar } = useContext(AppBarContext);

  const isEditOpen = openEdit || openToolbar;

  const handleFileSelect = (node: TNode) => {
    onFileClick(node);
  };

  const matchMimeType = (mimeType: string) => {
    const foundMimeType = Object.entries(NodeTypes).find(([key]) => mimeType.indexOf(key) !== -1);
    return foundMimeType ? foundMimeType[1] : NodeTypes.other;
  };

  const backgroundColor = (isSelected: boolean, row: number) => {
    let color = row % 2 ? Colors.lightgrey : Colors.white;
    if (isSelected) {
      color = Colors.aliceblue;
    }
    return color;
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        paddingBottom: '18px',
        backgroundColor: backgroundColor(isSelected, row),
        cursor: isStatic ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
      component="a"
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (isEditOpen) {
          e.preventDefault();
          handleFileSelect(node);
        }
      }}
      href={`${REACT_APP_ALFRESCO_DOWNLOAD_URL}/alfresco/versions/1/nodes/${id}/content?attachment=false`}
    >
      <Grid item mobile={1} tablet={0.5} desktop={0.5}>
        <Box component="img" src={matchMimeType(contentMimeType)} alt="Logo" />
      </Grid>
      <Grid item mobile={10} tablet={10.5} desktop={10.5}>
        <Typography variant="body1" sx={{ color: Colors.extrablack }}>
          {name}
        </Typography>
        <div style={{ display: 'flex', color: Colors.darkgrey, paddingBottom: '18px' }}>
          <Typography variant="body1" sx={{ marginRight: '8px' }}>
            {format(new Date(modifiedAt), DateFormat)}
          </Typography>
          <Typography variant="body1" sx={{ marginRight: '8px' }}>
            {getLocaleByteUnit(prettyBytes(contentSizeInBytes, { locale: 'fi' }), LocaleLang.FI)}
          </Typography>
        </div>
      </Grid>
    </Grid>
  );
};
