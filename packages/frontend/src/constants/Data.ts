export const FileFormats = [
  {
    name: 'PDF',
    value: 'PDF',
  },
  {
    name: 'Excel',
    value: 'EXCEL',
  },
  {
    name: 'Image',
    value: 'IMAGE',
  },
  {
    name: 'PowerPoint',
    value: 'PRESENTATION',
  },
  {
    name: 'Word',
    value: 'MSWORD',
  },
  {
    name: 'PlainText',
    value: 'TXT',
  },
];

export enum EMimeType {
  Excel = 'Excel',
  Image = 'Image',
  Word = 'Word',
  PDF = 'PDF',
  PowerPoint = 'PowerPoint',
  PlainText = 'PlainText',
}

export const mimeNamesMapping: { [name in EMimeType]: string } = {
  Excel: 'EXCEL',
  Image: 'IMAGE',
  Word: 'MSWORD',
  PDF: 'PDF',
  PowerPoint: 'PRESENTATION',
  PlainText: 'TXT',
};

export const SortDataType = {
  ASC_NAME: { field: 'name', ascending: true },
  DESC_NAME: { field: 'name', ascending: false },
  ASC_MODIFIED: { field: 'modified', ascending: true },
  DESC_MODIFIED: { field: 'modified', ascending: false },
  NONE: { field: null, ascending: false },
};

export const FileMaxSizeInBytes = 50000000;
