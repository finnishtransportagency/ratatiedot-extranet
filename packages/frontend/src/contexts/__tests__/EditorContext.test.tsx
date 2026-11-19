import { act, cleanup, render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { vi } from 'vitest';
import { EditorContext, EditorContextProvider } from '../EditorContext';

const page = vi.hoisted(() => ({ data: { fields: [{ children: [{ text: 'Saved' }] }] } }));
vi.mock('../../hooks/query/GetCategoryPageContent', () => ({ useGetCategoryPageContent: () => page }));
vi.mock('../../hooks/query/GetNoticePageContent', () => ({ useGetNoticePageContent: () => ({}) }));

let context: React.ContextType<typeof EditorContext>;
const DocumentState = () => {
  context = useContext(EditorContext);
  return <output aria-label="dirty">{String(context.hasUnsavedChanges)}</output>;
};

const document = (text: string) => [{ children: [{ text }] }];

afterEach(cleanup);

test('tracks edits, undo-to-saved, successful saves, and discard against the saved document', async () => {
  const router = createMemoryRouter([
    {
      path: '*',
      element: (
        <EditorContextProvider>
          <DocumentState />
        </EditorContextProvider>
      ),
    },
  ]);
  render(<RouterProvider router={router} />);
  await act(async () => {});
  expect(screen.getByLabelText('dirty')).toHaveTextContent('false');

  act(() => context.valueHandler(document('Draft')));
  expect(screen.getByLabelText('dirty')).toHaveTextContent('true');
  act(() => context.valueHandler(document('Saved')));
  expect(screen.getByLabelText('dirty')).toHaveTextContent('false');

  act(() => context.valueHandler(document('Submitted')));
  act(() => context.valueHandler(document('Newer edit')));
  act(() => context.markSaved(document('Submitted')));
  expect(screen.getByLabelText('dirty')).toHaveTextContent('true');

  await act(async () => context.valueReset());
  expect(context.value).toEqual(document('Submitted'));
  expect(context.editor.children).toEqual(document('Submitted'));
  expect(screen.getByLabelText('dirty')).toHaveTextContent('false');
});

test('preserves a dirty draft across refetches and resets it for a different page', async () => {
  const router = createMemoryRouter([
    {
      path: '*',
      element: (
        <EditorContextProvider>
          <DocumentState />
        </EditorContextProvider>
      ),
    },
  ]);
  const view = render(<RouterProvider router={router} />);
  await act(async () => {});
  act(() => context.valueHandler(document('Draft')));
  page.data = { fields: document('Refetched') };
  view.rerender(<RouterProvider router={router} />);
  await act(async () => router.navigate('/?refresh=true'));
  expect(context.value).toEqual(document('Draft'));
  expect(context.hasUnsavedChanges).toBe(true);

  await act(async () => router.navigate('/another'));
  expect(context.value).toEqual(document('Refetched'));
  expect(context.hasUnsavedChanges).toBe(false);
});
