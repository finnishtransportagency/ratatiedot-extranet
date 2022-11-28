import { Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { Tags } from '../../components/Tags';
import { ContainerWrapper } from '../Landing/index.styles';

export const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  return (
    <ContainerWrapper>
      <Typography variant="subtitle1">Hakutulokset "{query}"</Typography>
      <Tags />
    </ContainerWrapper>
  );
};
