import { Typography } from '@mui/material';
import styled from '@emotion/styled';

export const SubtitleWrapper = styled(Typography)(() => ({
  margin: '16px 0px',
  lineHeight: '32px',
})) as typeof Typography;

export const ParagraphWrapper = styled(Typography)(() => ({
  marginBottom: '16px',
})) as typeof Typography;
