import { Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { Tags } from '../../components/Tags';
import { ContainerWrapper } from '../Landing/index.styles';

// TODO: Use real data fetched from Backend (currently use mock data)
import mockData from './mockData.json';
import { NodeItem } from './NodeItem';

export const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  return (
    <ContainerWrapper>
      <Typography variant="subtitle1">Hakutulokset "{query}"</Typography>
      <Tags />
      <Typography variant="body1" sx={{ margin: '24px 0px' }}>
        {mockData.list.pagination.totalItems} tulosta
      </Typography>
      {mockData.list.entries.map((node: any, index: number) => (
        <NodeItem key={index} row={index} node={node} />
      ))}
    </ContainerWrapper>
  );
};
