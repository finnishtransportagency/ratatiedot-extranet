import { Box, Button } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createEditor, Node, Transforms } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { Colors } from '../constants/Colors';
import { SlateElement } from './slateEditorUtil';
import { ElementType } from './types';

interface EditorProps {
  value: Node[];
  setValue: (value: Node[]) => void;
  initialValue?: Node[];
}

const NoticeEditor = ({ value, setValue, initialValue }: EditorProps) => {
  const editor = useMemo(() => withReact(createEditor()), []);

  const initialContent = initialValue || [
    {
      type: ElementType.HEADING_TWO,
      children: [{ text: 'Otsikko' }],
    },
    {
      type: ElementType.PARAGRAPH_TWO,
      children: [{ text: 'Tekstisisältö' }],
    },
    /*  {
      type: 'image',
      url: 'https://sm.ign.com/ign_za/gallery/f/frieren-be/frieren-beyond-journeys-end-gallery_sekw.jpg',
      children: [{ text: '' }],
    }, */
  ];

  const [content, setContent] = useState<Node[]>(initialContent);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const url = reader.result as string;
      const image = { type: 'image', url, children: [{ text: '' }] };
      Transforms.insertNodes(editor, image);
    };

    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    inputRef.current!.click();
  };

  const renderElement = useCallback((props: any) => <SlateElement {...props} />, []);

  return (
    <Box sx={{ border: `1px dashed ${Colors.darkblue}`, padding: '10px' }}>
      <Slate editor={editor} initialValue={content} onChange={(value) => setValue(value)}>
        <Editable placeholder={'Muokkaa'} renderElement={renderElement} />
        <Button sx={{ marginLeft: '0' }} color="primary" variant="text" onClick={() => handleClick()}>
          Lisää kuva
        </Button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
      </Slate>
    </Box>
  );
};

/* const ImageNode = ({ element }) => {
  const editor = useSlateStatic() as ReactEditor;
  const path = ReactEditor.findPath(editor, element);

  return (
    <Box sx={{ position: 'relative' }}>
      <img
        src={element.url}
        style={{
          width: '100%',
          height: 'auto',
        }}
      />

      <Button
        onClick={() => Transforms.removeNodes(editor, { at: path })}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          minWidth: 0,
        }}
      >
        <RemoveCircle color="error">delete</RemoveCircle>
      </Button>
    </Box>
  );
}; */

export default NoticeEditor;
