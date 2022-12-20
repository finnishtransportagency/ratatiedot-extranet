export const FileFormats = ['PDF', 'Excel', 'Image', 'PowerPoint', 'Word', 'PlainText'];

export const FinnishRegions = ['Etelä', 'Länsi', 'Itä', 'Pohjoinen'];

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
