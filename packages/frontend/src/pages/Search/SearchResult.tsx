import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

import { Tags } from '../../components/Tags';
import { ContainerWrapper } from '../Landing/index.styles';

// TODO: Use real data fetched from Backend (currently use mock data)
import mockData from './mockData.json';
import { NodeItem } from './NodeItem';

export const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any>({}); // TODO:
  const query = searchParams.get('query');

  const { isLoading } = useQuery({
    queryKey: ['alfresco-search'],
    queryFn: async () => {
      const body = {
        searchParameters: [
          {
            parameterName: 'name',
            fileName: query,
          },
        ],
      };
      const response = await axios.post('/api/alfresco/search', body);
      return response.data;
    },
    onSuccess: (res) => {
      setData(res);
    },
    // temporary
    // TODO:
    onError: (err) => {
      console.log(err);
      setData(mockData);
    },
  });

  if (isLoading) {
    return (
      <ContainerWrapper>
        <CircularProgress />;
      </ContainerWrapper>
    );
  }
  return (
    <ContainerWrapper>
      <Typography variant="subtitle1">Hakutulokset "{query}"</Typography>
      <Tags />
      <Typography variant="body1" sx={{ margin: '24px 0px' }}>
        {data.list.pagination.totalItems} tulosta
      </Typography>
      <div style={{ marginLeft: '18px' }}>
        {data.list.entries.map((node: any, index: number) => (
          <NodeItem key={index} row={index} node={node} />
        ))}
      </div>
    </ContainerWrapper>
  );
};
