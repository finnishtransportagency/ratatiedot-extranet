export enum FontFormatType {
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINED = 'underlined',
}

export enum ElementType {
  PARAGRAPH = 'paragraph',
  HEADING_ONE = 'heading-one',
  HEADING_TWO = 'heading-two',
  LIST_ITEM = 'list-item',
  BULLET_LIST = 'bulleted-list',
  NUMBERED_LIST = 'numbered-list',
  LINK = 'link',
}

export interface IElement {
  type: ElementType;
}
