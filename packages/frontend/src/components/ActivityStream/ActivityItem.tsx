import { Box, Grid, Typography } from '@mui/material';
import { format } from 'date-fns';

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
import { matchRouteWithCategory, parseRouterName } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

import { ActivityTypes } from '../../constants/ActivityTypes';
import { Routes } from '../../constants/Routes';

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
  node: any;
  row: number;
  isSelected?: boolean;
};

export const ActivityItem = ({ node, row, isSelected = false }: NodeItemProps) => {
  const { mimeType, fileName, timestamp, action, alfrescoId } = node;
  const { rataextraRequestPage } = node.categoryDataBase;

  const isFolder = mimeType === 'folder';
  const isFile = mimeType !== 'folder';

  const isDeleted = action === ActivityTypes.FOLDER_DELETED || action === ActivityTypes.FILE_DELETED;

  const { VITE_ALFRESCO_DOWNLOAD_URL } = import.meta.env;
  const navigate = useNavigate();

  const routeToFolder = matchRouteWithCategory(Routes, rataextraRequestPage) as string;

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
    <>
      <Grid
        container
        spacing={2}
        sx={{
          paddingBottom: '18px',
          backgroundColor: backgroundColor(isSelected, row),
          cursor: 'pointer',
          textDecoration: 'none',
        }}
        component="a"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (isFolder && !isDeleted) {
            e.preventDefault();
            navigate(routeToFolder);
          }
        }}
        href={
          isFile && !isDeleted
            ? `${VITE_ALFRESCO_DOWNLOAD_URL}/alfresco/versions/1/nodes/${alfrescoId}/content/${encodeURI(
                fileName,
              )}?attachment=false`
            : undefined
        }
      >
        <Grid item mobile={1} tablet={0.5} desktop={0.5}>
          <Box component="img" src={isFile ? matchMimeType(mimeType) : Folder} alt="Logo" />
        </Grid>
        <Grid item mobile={10} tablet={10.5} desktop={10.5}>
          <Typography
            variant="body2"
            sx={{
              color: Colors.darkblue,
            }}
          >
            {parseRouterName(rataextraRequestPage)}
          </Typography>
          <Typography variant="body1" sx={{ color: Colors.extrablack }}>
            {fileName}
          </Typography>

          <div style={{ display: 'flex', color: Colors.darkgrey, paddingBottom: '18px' }}>
            <Typography variant="body1" sx={{ marginRight: '8px' }}>
              {format(new Date(timestamp), DateFormat)}
            </Typography>
          </div>
        </Grid>
      </Grid>
    </>
  );
};
