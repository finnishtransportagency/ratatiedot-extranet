// Import the Slate editor factory.
import { Button } from '@mui/material';
import { ElementType, FunctionComponent, useCallback, useMemo, useState } from 'react';
import { createEditor, Editor } from 'slate';

import { BaseEditor, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react';
import { ParagraphWrapper } from '../../pages/Landing/index.styles';
type CustomElement = { type: 'paragraph' | 'code' | 'bulleted-list'; children: CustomText[] };
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface RichEditorProps {
  isEditing: boolean;
  element: ElementType;
  elementProps: any;
}

const Toolbar = () => {
  const editor = useSlate();
  return (
    <div>
      <Button
        onClick={(event) => {
          event.preventDefault();
          Transforms.setNodes(editor, { type: 'code' }, { match: (n) => Editor.isBlock(editor, n) });
        }}
      >
        code
      </Button>
      <Button
        onClick={(event) => {
          event.preventDefault();
          Transforms.setNodes(editor, { type: 'paragraph' }, { match: (n) => Editor.isBlock(editor, n) });
        }}
      >
        paragraph
      </Button>
    </div>
  );
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

const CodeElement = (props: any) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

export const RichTextEditor: FunctionComponent<RichEditorProps> = (props: RichEditorProps) => {
  const [editor] = useState(() => withReact(createEditor()));
  const initialValue = useMemo(
    () =>
      JSON.parse(localStorage.getItem('content')!) || [
        {
          type: 'paragraph',
          children: [{ text: 'A line of text in a paragraph.' }],
        },
      ],
    [],
  );
  const [text, setText] = useState('A line of text in a paragraph.');
  const { element: Element, elementProps } = props;
  console.log(Element);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'quote':
        return <blockquote {...props} />;
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <ParagraphWrapper {...props} />;
    }
  }, []);
  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={(value) => {
        const isAstChange = editor.operations.some((op) => op.type !== 'set_selection');
        if (isAstChange) {
          // Save the value to Local Storage.
          const content = JSON.stringify(value);
          localStorage.setItem('content', content);
          setText(JSON.parse(content)[0].children[0].text);
          console.log(text);
        }
      }}
    >
      <>
        <Toolbar></Toolbar>
        <Editable
          readOnly={!props.isEditing}
          renderElement={renderElement}
          onKeyDown={(event) => {
            if (event.key === 'c' && event.ctrlKey) {
              // Prevent the "`" from being inserted by default.
              event.preventDefault();
              // Otherwise, set the currently selected blocks type to "code".
              Transforms.setNodes(editor, { type: 'code' }, { match: (n) => Editor.isBlock(editor, n) });
            }
            if (event.key === 'p' && event.ctrlKey) {
              // Prevent the "`" from being inserted by default.
              event.preventDefault();
              // Otherwise, set the currently selected blocks type to "code".
              Transforms.setNodes(editor, { type: 'paragraph' }, { match: (n) => Editor.isBlock(editor, n) });
            }
          }}
        ></Editable>
      </>
    </Slate>
  );
};
