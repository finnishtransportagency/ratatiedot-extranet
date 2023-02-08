export const FileFormats = ['PDF', 'Excel', 'Image', 'PowerPoint', 'Word', 'PlainText'];

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
  ASC_NAME: 'ASC_NAME',
  DESC_NAME: 'DESC_NAME',
  ASC_MODIFIED: 'ASC_MODIFIED',
  DESC_MODIFIED: 'DESC_MODIFIED',
  NONE: 'NONE',
};
