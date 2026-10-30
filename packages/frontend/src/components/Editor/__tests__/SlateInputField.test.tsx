import { cleanup, render, screen, act, fireEvent } from '@testing-library/react';
import { useContext } from 'react';
import { vi } from 'vitest';
import { ThemeProvider } from '@mui/material';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditorContextProvider } from '../../../contexts/EditorContext';

import { SlateInputField } from '../SlateInputField';
import { theme } from '../../../styles/createTheme';
import { AppBarContext, AppBarContextProvider } from '../../../contexts/AppBarContext';

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

const renderEditorStateControls = () => {
  const queryClient = createTestQueryClient();
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <QueryClientProvider client={queryClient}>
            <AppBarContextProvider>
              <EditorStateControls />
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
