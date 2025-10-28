import type { Notice, CategoryDataContents } from '@prisma/client';

type NoticeContentObject = {
  type: 'image';
  url: string;
  signedUrl?: string;
};
export type NoticeWithContentArray = Omit<Notice, 'content'> & { content: Array<NoticeContentObject> };

type CategoryDataContentsFieldsObject = {
  type: 'image';
  url: string;
  signedUrl?: string;
};
export type CategoryDataContentFieldObjects = Array<CategoryDataContentsFieldsObject>;
export type CategoryDataContentsWithFieldsArray = Omit<CategoryDataContents, 'fields'> & {
  fields: Array<CategoryDataContentsFieldsObject>;
};
