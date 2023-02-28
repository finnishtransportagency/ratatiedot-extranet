import { Link, List, ListItem, ListItemText, Typography } from '@mui/material';
import { Node, Editor, Transforms } from 'slate';
import { ElementType, FontFormatType, IElement } from './types';

interface IParagraphElement extends IElement {
  type: ElementType.PARAGRAPH;
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

type SlateElementProps = {
  attributes: any;
  children: any;
  element: IParagraphElement | IHeadingElement | IListElement | ILinkElement;
};
export const SlateElement = ({ attributes, children, element }: SlateElementProps) => {
  switch (element.type) {
    case ElementType.HEADING_ONE:
      return (
        <Typography variant="subtitle1" {...attributes}>
          {children}
        </Typography>
      );
    case ElementType.HEADING_TWO:
      return (
        <Typography variant="subtitle2" {...attributes}>
          {children}
        </Typography>
      );
    case ElementType.LIST_ITEM:
      return (
        <ListItem {...attributes}>
          <ListItemText disableTypography>{children}</ListItemText>
        </ListItem>
      );
    case ElementType.BULLET_LIST:
      return (
        <List component="ul" {...attributes}>
          {children}
        </List>
      );
    case ElementType.NUMBERED_LIST:
      return (
        <List component="ol" {...attributes}>
          {children}
        </List>
      );
    case ElementType.LINK:
      return (
        <Link href={element.url} target="_blank" rel="noopener noreferrer" {...attributes}>
          {children}
        </Link>
      );
    case ElementType.PARAGRAPH:
    default:
      return <Typography {...attributes}>{children}</Typography>;
  }
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
    type: isActive ? ElementType.PARAGRAPH : isList ? ElementType.LIST_ITEM : format,
  } as Partial<Node>);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
