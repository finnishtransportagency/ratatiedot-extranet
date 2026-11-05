import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { useContext } from 'react';
import { createMemoryRouter, Link, RouterProvider } from 'react-router-dom';
import { vi } from 'vitest';
import '../../../i18n';
import { AppBarContext, AppBarContextProvider } from '../../../contexts/AppBarContext';
import { EditorContext, EditorContextProvider } from '../../../contexts/EditorContext';
import { theme } from '../../../styles/createTheme';
import { EditorNavigationGuard } from '../EditorNavigationGuard';

const responses = vi.hoisted(() => ({
  page: { fields: [{ children: [{ text: 'Saved' }] }] },
  rights: { canRead: true, canWrite: true, isAdmin: false },
}));
vi.mock('../../../hooks/query/GetCategoryPageContent', () => ({
  useGetCategoryPageContent: () => ({ data: responses.page }),
}));
vi.mock('../../../hooks/query/GetNoticePageContent', () => ({ useGetNoticePageContent: () => ({}) }));
vi.mock('../../../hooks/query/GetUserRightPageContent', () => ({
  useGetUserRightPageContent: () => ({ data: responses.rights }),
}));

let editorContext: React.ContextType<typeof EditorContext>;
const Controls = () => {
  const { openToolbar, openToolbarHandler, closeToolbarWithoutSaveHandler } = useContext(AppBarContext);
  editorContext = useContext(EditorContext);
  return (
    <>
      <button onClick={openToolbarHandler}>Open editor</button>
      <button onClick={closeToolbarWithoutSaveHandler}>Close editor</button>
      <Link to="/second">Next page</Link>
      <output aria-label="Toolbar open">{String(openToolbar)}</output>
      <output aria-label="Draft">{JSON.stringify(editorContext.value)}</output>
      <output aria-label="Dirty">{String(editorContext.hasUnsavedChanges)}</output>
    </>
  );
};

const setup = async () => {
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <ThemeProvider theme={theme}>
            <AppBarContextProvider>
              <EditorContextProvider>
                <EditorNavigationGuard />
                <Controls />
              </EditorContextProvider>
            </AppBarContextProvider>
          </ThemeProvider>
        ),
      },
    ],
    { initialEntries: ['/previous', '/first', '/forward'], initialIndex: 1 },
  );
  render(<RouterProvider router={router} />);
  await act(async () => {});
  fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
  return router;
};

const edit = () => act(() => editorContext.valueHandler([{ children: [{ text: 'Draft' }] }]));

beforeEach(() => {
  vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('Cancel preserves the location, draft, toolbar, and navigation-link focus', async () => {
  const router = await setup();
  edit();
  const link = screen.getByRole('link', { name: 'Next page' });
  link.focus();
  fireEvent.click(link);
  expect(screen.getByRole('alertdialog', { name: 'Tallentamattomia muutoksia' })).toBeVisible();
  expect(router.state.location.pathname).toBe('/first');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Peruuta' })).toHaveFocus());
  fireEvent.click(screen.getByRole('button', { name: 'Peruuta' }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/first');
  expect(screen.getByLabelText('Draft')).toHaveTextContent('Draft');
  expect(screen.getByLabelText('Toolbar open')).toHaveTextContent('true');
  expect(link).toHaveFocus();
});

test('OK discards changes, continues to the intended location, and closes the toolbar', async () => {
  const router = await setup();
  edit();
  fireEvent.click(screen.getByRole('link', { name: 'Next page' }));
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'OK' })));
  expect(router.state.location.pathname).toBe('/second');
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Dirty')).toHaveTextContent('false');
  expect(screen.getByLabelText('Draft')).toHaveTextContent('Saved');
  expect(screen.getByLabelText('Toolbar open')).toHaveTextContent('false');
});

test.each([-1, 1])('blocks browser history navigation by %s and proceeds only after OK', async (delta) => {
  const router = await setup();
  edit();
  await act(async () => router.navigate(delta));
  expect(router.state.location.pathname).toBe('/first');
  expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'OK' })));
  await waitFor(() => expect(router.state.location.pathname).toBe(delta === -1 ? '/previous' : '/forward'));
});

test.each(['escape', 'backdrop', 'close'])('%s dismisses the warning without discarding changes', async (action) => {
  const router = await setup();
  edit();
  await act(async () => router.navigate('/second'));
  if (action === 'escape') {
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
  } else if (action === 'backdrop') {
    fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
  } else {
    fireEvent.click(screen.getByRole('button', { name: 'Sulje modaali' }));
  }
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/first');
  expect(editorContext.hasUnsavedChanges).toBe(true);
});

test.each(['unchanged', 'saved', 'discarded', 'undone', 'closed toolbar'])(
  'does not block navigation with %s content',
  async (condition) => {
    const router = await setup();
    if (condition !== 'unchanged') {
      edit();
    }
    if (condition === 'saved') {
      act(() => editorContext.markSaved(editorContext.value));
    } else if (condition === 'discarded') {
      await act(async () => editorContext.valueReset());
    } else if (condition === 'undone') {
      act(() => editorContext.valueHandler(responses.page.fields));
    } else if (condition === 'closed toolbar') {
      fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
    }
    await act(async () => router.navigate('/second'));
    expect(router.state.location.pathname).toBe('/second');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  },
);

test.each(['/first?filter=active', '/first#content'])(
  'allows same-view navigation to %s with a dirty editor',
  async (destination) => {
    const router = await setup();
    edit();
    await act(async () => router.navigate(destination));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Toolbar open')).toHaveTextContent('true');
    expect(editorContext.hasUnsavedChanges).toBe(true);
  },
);
