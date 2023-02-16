import { useGetCategoryFiles } from '../../hooks/query/CategoryFiles';
import { NodeItem } from './File';
import { getRouterName } from '../../utils/helpers';
import { ErrorMessage } from '../Notification/ErrorMessage';
import { Spinner } from '../Spinner';
import { useLayoutEffect, useState } from 'react';
import { ButtonWrapper } from '../../styles/common';
import { get } from 'lodash';

type TCategoryFilesProps = {
  categoryName: string;
};

export const CategoryFiles = ({ categoryName }: TCategoryFilesProps) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const { isLoading, isError, error, data } = useGetCategoryFiles({
    routerName: getRouterName(categoryName),
    page: page,
  });

  useLayoutEffect(() => {
    const entries = get(data, 'list.entries', []);
    if (entries.length) {
      setFileList((f) => {
        return [...f, ...data.list.entries];
      });
    }
  }, [data]);

  const loadMore = () => setPage(page + 1);

  if (isLoading) return <Spinner />;

  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      {fileList.map((node: any, index: number) => (
        <NodeItem key={index} row={index} node={node} />
      ))}
      {data.list.pagination.hasMoreItems && (
        <ButtonWrapper color="primary" variant="outlined" onClick={loadMore}>
          Lataa lisää
        </ButtonWrapper>
      )}
    </>
  );
};
