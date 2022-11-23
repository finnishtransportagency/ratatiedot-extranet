import { Typography } from '@mui/material';
import axios from 'axios';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContainerWrapper } from '../Landing/index.styles';

export const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  useEffect(() => {
    const searchDocs = async () => {
      try {
        const url = ` https://testiextranet.vayla.fi/alfresco/api/-default-/public/alfresco/versions/1/queries/nodes?term=${query}`;
        const data = await fetch(url, {
          headers: {
            Cookie: document.cookie,
          },
        });
        console.log(data);
      } catch (e) {}
    };

    searchDocs();
  });
  return (
    <ContainerWrapper>
      <Typography variant="subtitle1">Hakutulokset "{query}"</Typography>
    </ContainerWrapper>
  );
};
