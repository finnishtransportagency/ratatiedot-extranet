import { Node, Editor, Element, Transforms, Path, Range } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';

import { ContactEditorCard } from '../components/Editor/Cards/ContactEditorCard';
import { NotificationEditorCard } from '../components/Editor/Cards/NotificationEditorCard';
import { LinkPopup } from '../components/Editor/Popup/LinkPopup';
import { HighlightedTitle } from '../components/Typography/HighlightedTitle';
import { EditorContext, TSlateNode } from '../contexts/EditorContext';
import {
  createContactCardNode,
  createImageNode,
  createLinkNode,
  createNotificationNode,
  createParagraphNode,
} from './createSlateNode';

import {
  ElementType,
  FontFormatType,
  ICardElement,
  IHeadingElement,
  IImageElement,
  ILinkElement,
  IListElement,
  INotificationElement,
  IParagraphElement,
} from './types';
import { IconButton } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { useContext } from 'react';
import { AppBarContext } from '../contexts/AppBarContext';

export type SlateElementProps = {
  attributes: any;
  children: any;
  element:
    | IParagraphElement
    | IHeadingElement
    | IListElement
    | ILinkElement
    | INotificationElement
    | ICardElement
    | IImageElement;
};

export const SlateElement = ({ attributes, children, element }: SlateElementProps) => {
  const editor = useSlateStatic() as ReactEditor;
  const path = ReactEditor.findPath(editor, element as any);
  const { openToolbar } = useContext(AppBarContext);
  const { selectedImage } = useContext(EditorContext);

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
      return <LinkPopup attributes={attributes} children={children} element={element} />;
    case ElementType.CARD_TITLE:
      return <HighlightedTitle {...attributes}>{children}</HighlightedTitle>;
    case ElementType.CARD:
      return <ContactEditorCard attributes={attributes} children={children} element={element} />;
    case ElementType.PARAGRAPH_ONE:
      return (
        <p {...attributes} style={{ fontSize: '18px' }}>
          {children}
        </p>
      );
    case ElementType.IMAGE:
      return (
        <div {...attributes} style={{ position: 'relative' }}>
          {openToolbar && (
            <IconButton
              sx={{
                position: 'absolute',
                top: '0',
                left: '0',
                zIndex: '1',
                background: 'white',
                border: 'none',
                cursor: 'pointer',
                margin: '6px',
                '&:hover': { background: '#c3c3c3' },
              }}
              onClick={() => Transforms.removeNodes(editor, { at: path })}
            >
              <DeleteOutline fontSize="small" color="error" />
            </IconButton>
          )}
          <img
            src={selectedImage ? element.url : element.signedUrl}
            alt={element.alt}
            style={{ display: 'block', maxWidth: '100%', maxHeight: '20em' }}
          />
        </div>
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
  if (leaf.color) {
    children = (
      <span {...attributes} style={{ color: leaf.color }}>
        {children}
      </span>
    );
  }

  return <span {...attributes}>{children}</span>;
};

export const isMarkActive = (editor: any, format: FontFormatType) => {
  const marks = Editor.marks(editor) as any;
  return marks && marks[format];
};

export const toggleMark = (editor: any, format: FontFormatType) => {
  ReactEditor.focus(editor);
  const isActive = isMarkActive(editor, format);
  return isActive ? Editor.removeMark(editor, format) : Editor.addMark(editor, format, true);
};

export const isColorActive = (editor: any, format: FontFormatType, color: string) => {
  const marks = Editor.marks(editor) as any;
  return marks && marks[format] && marks[format] === color;
};

export const toggleColor = (editor: any, format: FontFormatType, color: string) => {
  ReactEditor.focus(editor);
  const isActive = isColorActive(editor, format, color);
  return isActive ? Editor.removeMark(editor, format) : Editor.addMark(editor, format, color);
};

export const isBlockActive = (editor: any, format: ElementType) => {
  const [match] = Editor.nodes(editor, { match: (n: Node) => (n as any).type === format }) as any;
  return !!match;
};

export const toggleBlock = (editor: any, format: ElementType) => {
  ReactEditor.focus(editor);
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

export const removeLink = (editor: any, opts = {}) => {
  Transforms.unwrapNodes(editor, {
    ...opts,
    match: (n) => !Editor.isEditor(n) && Element.isElement(n) && (n as any).type === ElementType.LINK,
  });
};

export const insertLink = (editor: any, url: string) => {
  if (!url) return;

  const { selection } = editor;
  const link = createLinkNode(url, 'Uusi linkki');

  ReactEditor.focus(editor);

  if (!!selection) {
    const [parentNode, parentPath] = Editor.parent(editor, selection.focus?.path);

    // Remove the Link node if we're inserting a new link node inside of another link.
    if ((parentNode as any).type === ElementType.LINK) {
      removeLink(editor);
    }

    if (editor.isVoid(parentNode)) {
      // Insert the new link after the void node
      Transforms.insertNodes(
        editor,
        {
          type: ElementType.PARAGRAPH_ONE,
          children: [link],
        } as any,
        {
          at: Path.next(parentPath),
          select: true,
        },
      );
    } else if (Range.isCollapsed(selection)) {
      // Insert the new link in our last known location
      Transforms.insertNodes(editor, link, { select: true });
    } else {
      // Wrap the currently selected range of text into a Link
      Transforms.wrapNodes(editor, link, { split: true });
      // Remove the highlight and move the cursor to the end of the highlight
      Transforms.collapse(editor, { edge: 'end' });
    }
  } else {
    // Insert the new link node at the bottom of the Editor when selection is falsey
    Transforms.insertNodes(editor, {
      type: ElementType.PARAGRAPH_ONE,
      children: [link],
    } as any);
  }
};

export const openNotification = (editor: any, format: ElementType) => {
  const isNotification =
    format === ElementType.NOTIFICATION_INFO ||
    format === ElementType.NOTIFICATION_WARNING ||
    format === ElementType.NOTIFICATION_ERROR ||
    format === ElementType.NOTIFICATION_CONFIRMATION;

  if (!format || !isNotification) return;

  Transforms.select(editor, Editor.end(editor, []));
  ReactEditor.focus(editor);

  Transforms.unwrapNodes(editor, {
    match: (n: Node) =>
      (n as any).type === ElementType.NOTIFICATION_INFO ||
      (n as any).type === ElementType.NOTIFICATION_WARNING ||
      (n as any).type === ElementType.NOTIFICATION_ERROR ||
      (n as any).type === ElementType.NOTIFICATION_CONFIRMATION,
    split: true,
  });

  Transforms.insertNodes(editor, createNotificationNode(format), { at: Editor.start(editor, []) });
};

export const insertParagraph = (editor: any, format: ElementType) => {
  const isText = format === ElementType.PARAGRAPH_TWO || format === ElementType.PARAGRAPH_ONE;
  if (!format || !isText) return;
  Transforms.select(editor, Editor.end(editor, []));
  ReactEditor.focus(editor);

  const text = createParagraphNode();
  Transforms.insertNodes(editor, text, { at: Editor.end(editor, []) });
};

export const openContactCard = (editor: any, format: ElementType) => {
  const isCard = format === ElementType.CARD;
  if (!format || !isCard) return;

  Transforms.select(editor, Editor.end(editor, []));
  ReactEditor.focus(editor);

  Transforms.unwrapNodes(editor, {
    match: (n: Node) => (n as any).type === ElementType.CARD,
    split: true,
  });
  const card = createContactCardNode();
  Transforms.insertNodes(editor, card, { at: [editor.children.length - 1] });
};

export const deleteEditor = (editor: any) => {
  Transforms.delete(editor, {
    at: {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    },
  });
};

export const insertImage = (editor: any, format: ElementType, url: string) => {
  const isImage = format === ElementType.IMAGE;
  if (!format || !isImage) return;

  Transforms.select(editor, Editor.end(editor, []));
  ReactEditor.focus(editor);

  Transforms.unwrapNodes(editor, {
    match: (n: Node) => (n as any).type === ElementType.IMAGE,
    split: true,
  });
  const image = createImageNode(url);
  Transforms.insertNodes(editor, image, { at: [editor.children.length - 1] });
};

export const isSlateValueEmpty = (value: TSlateNode[]): boolean => {
  return value.every((node: TSlateNode) => {
    if (typeof node.children[0].text !== 'undefined') return !node.children[0].text;
    else if (typeof node.children[0].children !== 'undefined') return isSlateValueEmpty(node.children as TSlateNode[]);
  });
};
