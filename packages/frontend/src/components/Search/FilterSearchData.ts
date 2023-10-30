export enum SearchParameterName {
  MIME = 'mime',
  CATEGORY = 'category',
  ANCESTOR = 'ancestor',
}

export interface Category {
  id: string;
  alfrescoId: string;
  name: string;
}

export interface IItem {
  name: string;
  type: SearchParameterName;
  items: string[];
}
