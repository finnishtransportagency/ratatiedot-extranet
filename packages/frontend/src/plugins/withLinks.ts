import { ElementType, ILinkElement } from '../utils/types';

const withLinks = (editor: any) => {
  const { isInline } = editor;

  editor.isInline = (element: ILinkElement) => (element.type === ElementType.LINK ? true : isInline(element));

  return editor;
};

export default withLinks;
