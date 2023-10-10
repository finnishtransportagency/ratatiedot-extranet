import { Box, Grid, Typography } from '@mui/material';
import { format } from 'date-fns';
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
import { getLocaleByteUnit, matchRouteWithCategory, parseRouterName } from '../../utils/helpers';
import { LocaleLang } from '../../constants/Units';
import { AlfrescoCombinedResponse } from '../../types/types';
import { Routes } from '../../constants/Routes';
import { useNavigate } from 'react-router-dom';

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
  node: AlfrescoCombinedResponse;
  row: number;
  isSelected?: boolean;
  onFileClick?: (node: AlfrescoCombinedResponse['nodeEntry']) => void;
};

export const ActivityItem = ({ node, row, onFileClick = () => {}, isSelected = false }: NodeItemProps) => {
  const { activityEntry, nodeEntry, categoryName } = node;
  const { activitySummary, postedAt, activityType } = activityEntry;
  const { firstName, lastName } = activitySummary;
  const { name, content, isFile, id, isFolder } = nodeEntry;
  const contentMimeType = get(content, 'mimeType', '');
  const contentSizeInBytes = get(content, 'sizeInBytes', 0);
  const { title } = activitySummary;
  const { VITE_ALFRESCO_DOWNLOAD_URL } = import.meta.env;
  const navigate = useNavigate();

  const handleFileSelect = (node: AlfrescoCombinedResponse['nodeEntry']) => {
    onFileClick(node);
  };

  const category = nodeEntry.path.elements[4]?.name;
  const routeToFolder = matchRouteWithCategory(Routes, category) as string;

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
          if (isFolder) {
            e.preventDefault();
            navigate(routeToFolder);
          }
        }}
        href={
          isFile
            ? `${VITE_ALFRESCO_DOWNLOAD_URL}/alfresco/versions/1/nodes/${id}/content/${encodeURI(
                name,
              )}?attachment=false`
            : `${routeToFolder}`
        }
      >
        <Grid item mobile={1} tablet={0.5} desktop={0.5}>
          <Box component="img" src={isFile ? matchMimeType(contentMimeType) : Folder} alt="Logo" />
        </Grid>
        <Grid item mobile={10} tablet={10.5} desktop={10.5}>
          <Typography
            variant="body2"
            sx={{
              color: Colors.darkblue,
            }}
          >
            {parseRouterName(categoryName)}
          </Typography>
          <Typography variant="body1" sx={{ color: Colors.extrablack }}>
            {title}
          </Typography>
          <div style={{ display: 'flex', color: Colors.darkgrey, paddingBottom: '18px' }}>
            <Typography variant="body1" sx={{ marginRight: '8px' }}>
              {format(new Date(postedAt), DateFormat)}
            </Typography>
            {isFile && (
              <Typography variant="body1" sx={{ marginRight: '8px' }}>
                {getLocaleByteUnit(prettyBytes(contentSizeInBytes, { locale: 'fi' }), LocaleLang.FI)}
              </Typography>
            )}
          </div>
        </Grid>
      </Grid>
    </>
  );
};
