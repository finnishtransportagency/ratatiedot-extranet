import { Typography } from '@mui/material';
import styled from '@emotion/styled';

export const SubtitleWrapper = styled(Typography)(() => ({
  margin: '24px',
})) as typeof Typography;

export const ParagraphWrapper = styled(Typography)(() => ({
  padding: '0 8px',
})) as typeof Typography;
