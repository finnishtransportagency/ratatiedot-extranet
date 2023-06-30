import { Box, Collapse, Grid, Typography } from '@mui/material';
import { format, isAfter } from 'date-fns';
import prettyBytes from 'pretty-bytes';
import { get } from 'lodash';

import Folder from '../../assets/icons/Folder.svg';
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
import { useContext, useState } from 'react';
import { AppBarContext } from '../../contexts/AppBarContext';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { CategoryFiles } from './CategoryFiles';

export const NodeTypes = {
  other: Other,
  word: Word,
  sheet: Excel,
  excel: Excel,
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
  const [folderOpen, setFolderOpen] = useState(false);

  const { entry } = node;
  const { id, name, modifiedAt, content, isFile, isFolder } = entry;
  const description = entry.properties?.['cm:description'];
  const title = entry.properties?.['cm:title'];
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

  const toggleFolderOpen = () => {
    if (isFolder) {
      setFolderOpen(!folderOpen);
    }
  };

  return (
    <>
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
          if (isFolder) {
            e.preventDefault();
            toggleFolderOpen();
          }
        }}
        href={
          isFile
            ? `${REACT_APP_ALFRESCO_DOWNLOAD_URL}/alfresco/versions/1/nodes/${id}/content/${encodeURI(
                name,
              )}?attachment=false`
            : ''
        }
      >
        <Grid item mobile={1} tablet={0.5} desktop={0.5}>
          <Box component="img" src={isFile ? matchMimeType(contentMimeType) : Folder} alt="Logo" />
        </Grid>
        <Grid item mobile={10} tablet={10.5} desktop={10.5}>
          <Typography variant="body1" sx={{ color: Colors.extrablack }}>
            {/* TODO: Proper concat */}
            {name + title}
          </Typography>
          <Typography variant="body1" sx={{ color: Colors.darkgrey }}>
            {description}
          </Typography>
          <div style={{ display: 'flex', color: Colors.darkgrey, paddingBottom: '18px' }}>
            {/* Show dash as the date if file was part of the bulk upload */}
            <Typography variant="body1" sx={{ marginRight: '8px' }}>
              {isAfter(new Date(modifiedAt), new Date(2023, 3, 25)) ? format(new Date(modifiedAt), DateFormat) : '-'}
            </Typography>
            {isFile && (
              <Typography variant="body1" sx={{ marginRight: '8px' }}>
                {getLocaleByteUnit(prettyBytes(contentSizeInBytes, { locale: 'fi' }), LocaleLang.FI)}
              </Typography>
            )}
          </div>
        </Grid>
        {isFolder && (
          <Grid item mobile={1} tablet={0.5} desktop={0.5}>
            {folderOpen ? <ExpandLess /> : <ExpandMore />}
          </Grid>
        )}
      </Grid>
      <Collapse key={`${name}-Collapse`} in={folderOpen} timeout="auto" unmountOnExit>
        <CategoryFiles nestedFolderId={id} />
      </Collapse>
    </>
  );
};
