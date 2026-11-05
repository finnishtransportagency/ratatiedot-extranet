import { cleanup, render, screen, act, fireEvent } from '@testing-library/react';
import { useContext } from 'react';
import { vi } from 'vitest';
import { ThemeProvider } from '@mui/material';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import {
  createEditorWithPlugins,
  EditorContext,
  EditorContextProvider,
  nodeTemplate,
} from '../../../contexts/EditorContext';

import { SlateInputField } from '../SlateInputField';
import { theme } from '../../../styles/createTheme';
import { AppBarContext, AppBarContextProvider } from '../../../contexts/AppBarContext';

vi.mock('../../../hooks/query/GetCategoryPageContent', () => ({
  useGetCategoryPageContent: () => ({}),
}));
vi.mock('../../../hooks/query/GetNoticePageContent', () => ({
  useGetNoticePageContent: () => ({}),
}));

beforeAll(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithRouter = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  const router = createMemoryRouter(
    [{ path: '/', element: <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider> }],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
};

const customSlateInputFieldRender = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  const wrappedUI = (
    <QueryClientProvider client={queryClient}>
      <AppBarContextProvider>
        <EditorContextProvider>{ui}</EditorContextProvider>
      </AppBarContextProvider>
    </QueryClientProvider>
  );

  const router = createMemoryRouter([{ path: '/', element: wrappedUI }], { initialEntries: ['/'] });
  return render(<RouterProvider router={router} />);
};

const EditorStateControls = () => {
  const { openToolbar, openEdit, openToolbarHandler, closeToolbarHandler, openDesktopDrawer } =
    useContext(AppBarContext);

  return (
    <>
      <button onClick={openToolbarHandler}>Open editor</button>
      <button onClick={closeToolbarHandler}>Open confirmation</button>
      <output aria-label="Toolbar open">{String(openToolbar)}</output>
      <output aria-label="Confirmation open">{String(openEdit)}</output>
      <output aria-label="Drawer open">{String(openDesktopDrawer)}</output>
    </>
  );
};

const renderEditorStateControls = (field?: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <QueryClientProvider client={queryClient}>
            <AppBarContextProvider>
              <EditorStateControls />
              {field && (
                <EditorContextProvider>
                  <ThemeProvider theme={theme}>{field}</ThemeProvider>
                </EditorContextProvider>
              )}
            </AppBarContextProvider>
          </QueryClientProvider>
        ),
      },
    ],
    { initialEntries: ['/first'] },
  );
  render(<RouterProvider router={router} />);
  return router;
};

describe('Editor state on navigation', () => {
  afterEach(cleanup);

  test('reopens an editable empty field after navigating away and back', async () => {
    const EmptyField = () => {
      const { openToolbar, openEdit } = useContext(AppBarContext);
      return openToolbar || openEdit ? <SlateInputField /> : null;
    };
    const router = renderEditorStateControls(<EmptyField />);

    fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
    expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'true');

    await act(async () => router.navigate('/second'));
    expect(screen.queryByTestId('slate-editor')).not.toBeInTheDocument();
    await act(async () => router.navigate(-1));
    expect(router.state.location.pathname).toBe('/first');

    fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
    expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'true');
    expect(screen.getByTestId('slate-editor')).toHaveStyle({ borderStyle: 'dashed', padding: '10px' });
    expect(await screen.findByText(/.+/, { selector: '[data-slate-placeholder]' })).toBeInTheDocument();
    expect(screen.getByTestId('slate-editor').querySelector('[data-slate-zero-width]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open confirmation' }));
    expect(screen.getByTestId('slate-editor').querySelector('[data-slate-editor]')).toHaveAttribute(
      'contenteditable',
      'false',
    );
    expect(screen.getByTestId('slate-editor')).not.toHaveStyle({ borderStyle: 'dashed' });
    expect(screen.getByTestId('slate-editor')).toHaveStyle({ padding: '0px' });
    expect(screen.getByTestId('slate-editor').querySelector('[data-slate-placeholder]')).not.toBeInTheDocument();
  });

  test.each(['Open editor', 'Open confirmation'])('%s closes when the pathname changes', async (buttonName) => {
    const router = renderEditorStateControls();
    const drawerState = screen.getByLabelText('Drawer open').textContent;

    fireEvent.click(screen.getByRole('button', { name: buttonName }));
    expect(
      screen.getByLabelText(buttonName === 'Open editor' ? 'Toolbar open' : 'Confirmation open'),
    ).toHaveTextContent('true');

    await act(async () => {
      await router.navigate('/second');
    });

    expect(router.state.location.pathname).toBe('/second');
    expect(screen.getByLabelText('Toolbar open')).toHaveTextContent('false');
    expect(screen.getByLabelText('Confirmation open')).toHaveTextContent('false');
    expect(screen.getByLabelText('Drawer open').textContent).toBe(drawerState);

    fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
    expect(screen.getByLabelText('Toolbar open')).toHaveTextContent('true');
  });

  test.each([
    ['Open editor', 'Toolbar open', '/first?filter=active'],
    ['Open editor', 'Toolbar open', '/first#content'],
    ['Open confirmation', 'Confirmation open', '/first?filter=active'],
    ['Open confirmation', 'Confirmation open', '/first#content'],
  ])('%s stays open when navigating to %s at %s', async (buttonName, stateLabel, destination) => {
    const router = renderEditorStateControls();
    fireEvent.click(screen.getByRole('button', { name: buttonName }));

    await act(async () => {
      await router.navigate(destination);
    });

    expect(screen.getByLabelText(stateLabel)).toHaveTextContent('true');
  });
});

describe('SlateInputField component', () => {
  let component: React.ReactElement;

  beforeEach(() => {
    component = (
      <ThemeProvider theme={theme}>
        <SlateInputField />
      </ThemeProvider>
    );
  });

  afterEach(cleanup);

  test('opens an empty field even when Slate already reports it focused', async () => {
    const editor = createEditorWithPlugins(createEditor());
    const isFocused = vi.spyOn(ReactEditor, 'isFocused').mockReturnValue(true);
    const EmptyEditor = () => {
      const editorContext = useContext(EditorContext);
      const appBarContext = useContext(AppBarContext);
      return (
        <EditorContext.Provider value={{ ...editorContext, editor, value: nodeTemplate }}>
          <AppBarContext.Provider value={{ ...appBarContext, openToolbar: true }}>{component}</AppBarContext.Provider>
        </EditorContext.Provider>
      );
    };

    try {
      await act(async () => renderWithRouter(<EmptyEditor />));

      expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'true');
      expect(screen.getByTestId('slate-editor')).toHaveStyle({ borderStyle: 'dashed', padding: '10px' });
      expect(await screen.findByText(/.+/, { selector: '[data-slate-placeholder]' })).toBeInTheDocument();
    } finally {
      isFocused.mockRestore();
    }
  });

  test('SlateInputField should render properly', async () => {
    await act(async () => {
      renderWithRouter(component);
    });
  });

  test('SlateInputField should render properly in contexts', async () => {
    await act(async () => {
      customSlateInputFieldRender(component);
    });
    expect(screen.getByTestId('slate-editor')).toBeTruthy();
  });
});
