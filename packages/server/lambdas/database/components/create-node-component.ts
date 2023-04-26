import { devLog } from '../../../utils/logger';
import { DatabaseClient } from '../../database/client';
import { handlePrismaError, PrismaError } from '../error/databaseError';

const database = await DatabaseClient.build();

// interface NodeComponent {
//   id: string;
//   name: string;
//   title: string;
// }

export const createFolderComponent = async (categoryId: string, props: any) => {
  devLog.info('ID: \n' + JSON.stringify(categoryId, null, 2));
  devLog.info('PROPS: \n' + JSON.stringify(props, null, 2));
  const component = {
    id: props.entry.id,
    name: props.entry.name,
    title: props.entry.properties['cm:title'],
  };

  let response = null;
  try {
    response = await database.categoryComponent.create({
      data: {
        node: {
          create: {
            title: component.title,
            type: 'Folder',
            alfrescoNodeId: component.id,
          },
        },
        categoryDataBase: {
          connect: {
            id: categoryId,
          },
        },
      },
    });
  } catch (error) {
    handlePrismaError(error as PrismaError);
    response = error;
  }
  devLog.debug('PRISMA---------> \n' + JSON.stringify(response, null, 2));

  return response;
};
