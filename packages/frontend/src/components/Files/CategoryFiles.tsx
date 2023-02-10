import { useGetCategoryFiles } from '../../hooks/query/CategoryFiles';
import { NodeItem } from './File';
import { getRouterName } from '../../utils/helpers';
import { ErrorMessage } from '../Notification/ErrorMessage';
import { Spinner } from '../Spinner';

type TCategoryFilesProps = {
  categoryName: string;
};

export const CategoryFiles = ({ categoryName }: TCategoryFilesProps) => {
  const { isLoading, isError, error, data } = useGetCategoryFiles({
    routerName: getRouterName(categoryName),
  });

  if (isLoading) return <Spinner />;

  if (isError) return <ErrorMessage error={error} />;

  return data.list.entries.map((node: any, index: number) => <NodeItem key={index} row={index} node={node} />);
};
