import type { Descendant, Text } from 'slate';

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
  CARD_TITLE = 'card_title',
  CARD = 'card',
  IMAGE = 'image',
}

export type FormattedText = Text & {
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  color?: string;
};

export interface IElement {
  type: ElementType;
  children: Descendant[];
}

export interface IParagraphElement extends IElement {
  type: ElementType.PARAGRAPH_ONE | ElementType.PARAGRAPH_TWO;
}

export interface IHeadingElement extends IElement {
  type: ElementType.HEADING_ONE | ElementType.HEADING_TWO;
  level: number;
}

export interface IListElement extends IElement {
  type: ElementType.LIST_ITEM | ElementType.BULLET_LIST | ElementType.NUMBERED_LIST;
}

export interface ILinkElement extends IElement {
  type: ElementType.LINK;
  href: string;
}

export interface INotificationElement extends IElement {
  type:
    | ElementType.NOTIFICATION_INFO
    | ElementType.NOTIFICATION_WARNING
    | ElementType.NOTIFICATION_ERROR
    | ElementType.NOTIFICATION_CONFIRMATION;
}

export interface ICardElement extends IElement {
  type: ElementType.CARD | ElementType.CARD_TITLE;
}

export interface IImageElement extends IElement {
  type: ElementType.IMAGE;
  url: string;
  signedUrl: string;
  alt: string;
}
