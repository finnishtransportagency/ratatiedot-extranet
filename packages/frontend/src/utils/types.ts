export enum FontFormatType {
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINED = 'underlined',
  COLOR = 'color',
}

export enum ElementType {
  PARAGRAPH_ONE = 'paragraph-one',
  PARAGRAPH_TWO = 'paragraph-two',
  HEADING_ONE = 'heading-one',
  HEADING_TWO = 'heading-two',
  LIST_ITEM = 'list-item',
  BULLET_LIST = 'bulleted-list',
  NUMBERED_LIST = 'numbered-list',
  LINK = 'link',
  NOTIFICATION_INFO = 'notification_info',
  NOTIFICATION_WARNING = 'notification_warning',
  NOTIFICATION_ERROR = 'notification_error',
  NOTIFICATION_CONFIRMATION = 'notification_confirmation',
}

export interface IElement {
  type: ElementType;
}
