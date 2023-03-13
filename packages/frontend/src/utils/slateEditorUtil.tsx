import { Link } from '@mui/material';
import { Node, Editor, Transforms } from 'slate';
import { NotificationEditorCard } from '../components/Cards/NotificationEditorCard';
import { TSlateNode } from '../contexts/EditorContext';

import { ElementType, FontFormatType, IElement } from './types';

interface IParagraphElement extends IElement {
  type: ElementType.PARAGRAPH_ONE | ElementType.PARAGRAPH_TWO;
}

interface IHeadingElement extends IElement {
  type: ElementType.HEADING_ONE | ElementType.HEADING_TWO;
  level: number;
}

interface IListElement extends IElement {
  type: ElementType.LIST_ITEM | ElementType.BULLET_LIST | ElementType.NUMBERED_LIST;
}

interface ILinkElement extends IElement {
  type: ElementType.LINK;
  url: string;
}

export interface INotificationElement extends IElement {
  type:
    | ElementType.NOTIFICATION_INFO
    | ElementType.NOTIFICATION_WARNING
    | ElementType.NOTIFICATION_ERROR
    | ElementType.NOTIFICATION_CONFIRMATION;
}

export type SlateElementProps = {
  attributes: any;
  children: any;
  element: IParagraphElement | IHeadingElement | IListElement | ILinkElement | INotificationElement;
};

export const SlateElement = ({ attributes, children, element }: SlateElementProps) => {
  switch (element.type) {
    case ElementType.NOTIFICATION_INFO:
    case ElementType.NOTIFICATION_WARNING:
    case ElementType.NOTIFICATION_ERROR:
    case ElementType.NOTIFICATION_CONFIRMATION:
      return <NotificationEditorCard attributes={attributes} children={children} element={element} />;
    case ElementType.HEADING_ONE:
      return (
        <span {...attributes} style={{ fontFamily: 'Exo2-Bold', fontSize: '23px' }}>
          {children}
        </span>
      );
    case ElementType.HEADING_TWO:
      return (
        <span {...attributes} style={{ fontFamily: 'Exo2-Bold', fontSize: '20px' }}>
          {children}
        </span>
      );
    case ElementType.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    case ElementType.BULLET_LIST:
      return <ul {...attributes}>{children}</ul>;
    case ElementType.NUMBERED_LIST:
      return <ol {...attributes}>{children}</ol>;
    case ElementType.LINK:
      return (
        <Link
          href={element.url}
          target="_blank"
          rel="noopener noreferrer"
          {...attributes}
          sx={{ textDecoration: 'none' }}
        >
          {children}
        </Link>
      );
    case ElementType.PARAGRAPH_ONE:
      return (
        <span {...attributes} style={{ fontSize: '18px' }}>
          {children}
        </span>
      );
    case ElementType.PARAGRAPH_TWO:
    default:
      return <span {...attributes}>{children}</span>;
  }
};

export const SlateLeaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <span style={{ fontFamily: 'Exo2-Bold' }}>{children}</span>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underlined) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export const isMarkActive = (editor: any, format: FontFormatType) => {
  const marks = Editor.marks(editor) as any;
  return marks && marks[format];
};

export const toggleMark = (editor: any, format: FontFormatType) => {
  const isActive = isMarkActive(editor, format);
  return isActive ? Editor.removeMark(editor, format) : Editor.addMark(editor, format, true);
};

export const isBlockActive = (editor: any, format: ElementType) => {
  const [match] = Editor.nodes(editor, { match: (n: Node) => (n as any).type === format }) as any;
  return !!match;
};

export const toggleBlock = (editor: any, format: ElementType) => {
  const isActive = isBlockActive(editor, format);
  const isList = format === ElementType.BULLET_LIST || format === ElementType.NUMBERED_LIST;

  Transforms.unwrapNodes(editor, {
    match: (n: Node) => (n as any).type === ElementType.BULLET_LIST || (n as any).type === ElementType.NUMBERED_LIST,
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? ElementType.PARAGRAPH_TWO : isList ? ElementType.LIST_ITEM : format,
  } as Partial<Node>);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const toggleNotification = (editor: any, format: ElementType) => {
  const isActive = isBlockActive(editor, format);
  const isNotification =
    format === ElementType.NOTIFICATION_INFO ||
    format === ElementType.NOTIFICATION_WARNING ||
    format === ElementType.NOTIFICATION_ERROR ||
    format === ElementType.NOTIFICATION_CONFIRMATION;

  Transforms.unwrapNodes(editor, {
    match: (n: Node) =>
      (n as any).type === ElementType.NOTIFICATION_INFO ||
      (n as any).type === ElementType.NOTIFICATION_WARNING ||
      (n as any).type === ElementType.NOTIFICATION_ERROR ||
      (n as any).type === ElementType.NOTIFICATION_CONFIRMATION,
    split: true,
  });

  if (!isActive && isNotification) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const deleteNotification = (editor: any, format: ElementType) => {
  Transforms.unwrapNodes(editor, {
    match: (n: Node) =>
      (n as any).type === ElementType.NOTIFICATION_INFO ||
      (n as any).type === ElementType.NOTIFICATION_WARNING ||
      (n as any).type === ElementType.NOTIFICATION_ERROR ||
      (n as any).type === ElementType.NOTIFICATION_CONFIRMATION,
    split: true,
  });
};

export const deleteEditor = (editor: any) => {
  Transforms.delete(editor, {
    at: {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    },
  });
};

export const isSlateValueEmpty = (value: TSlateNode[]): boolean => {
  return value.every((node: TSlateNode) => {
    if (typeof node.children[0].text !== 'undefined') return !node.children[0].text;
    else if (typeof node.children[0].children !== 'undefined') return isSlateValueEmpty(node.children as TSlateNode[]);
  });
};
