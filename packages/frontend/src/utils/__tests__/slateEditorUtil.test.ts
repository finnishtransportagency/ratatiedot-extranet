import { isSlateValueEmpty } from '../slateEditorUtil';

describe('slateEditorUtil', () => {
  describe('isSlateValueEmpty', () => {
    it('should return true', () => {
      const text = [{ type: 'paragraph-two', children: [{ text: '' }] }];
      const bulletList = [
        {
          type: 'bulleted-list',
          children: [
            { type: 'list-item', children: [{ text: '' }] },
            { type: 'list-item', children: [{ text: '' }] },
          ],
        },
      ];
      const numberedList = [
        {
          type: 'numbered-list',
          children: [
            { type: 'list-item', children: [{ text: '' }] },
            { type: 'list-item', children: [{ text: '' }] },
          ],
        },
      ];
      const combinedNodes = [...text, ...bulletList, ...numberedList];
      expect(isSlateValueEmpty(text)).toBe(true);
      expect(isSlateValueEmpty(bulletList)).toBe(true);
      expect(isSlateValueEmpty(numberedList)).toBe(true);
      expect(isSlateValueEmpty(combinedNodes)).toBe(true);
    });

    it('should return false', () => {
      const text = [{ type: 'paragraph-two', children: [{ text: 'Hello' }] }];
      const bulletList = [
        {
          type: 'bulleted-list',
          children: [
            { type: 'list-item', children: [{ text: '' }] },
            { type: 'list-item', children: [{ text: 'Hello' }] },
          ],
        },
      ];
      const numberedList = [
        {
          type: 'numbered-list',
          children: [
            { type: 'list-item', children: [{ text: 'Hello' }] },
            { type: 'list-item', children: [{ text: 'Hello' }] },
          ],
        },
      ];
      const combinedNodes = [...text, ...bulletList, ...numberedList];
      expect(isSlateValueEmpty(text)).toBe(false);
      expect(isSlateValueEmpty(bulletList)).toBe(false);
      expect(isSlateValueEmpty(numberedList)).toBe(false);
      expect(isSlateValueEmpty(combinedNodes)).toBe(false);
    });
  });
});

// Or can set `"isolatedModules": false` in tsconfig.json
export {};
