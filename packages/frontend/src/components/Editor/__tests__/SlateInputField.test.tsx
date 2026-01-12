import { cleanup, render, screen, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { createEditor } from 'slate';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createEditorWithPlugins, EditorContextProvider } from '../../../contexts/EditorContext';

import { SlateInputField } from '../SlateInputField';
import { theme } from '../../../styles/createTheme';
import { AppBarContextProvider } from '../../../contexts/AppBarContext';

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

const customSlatInputFieldRender = (ui: any, { providerProps, ...renderOptions }: any) => {
  const { openToolbar = false } = providerProps;
  const {
    editor = createEditorWithPlugins(createEditor()),
    value = [{ children: [{ text: '' }] }],
    valueHandler = () => {},
  } = providerProps;

  const queryClient = createTestQueryClient();
  const wrappedUI = (
    <QueryClientProvider client={queryClient}>
      <AppBarContextProvider openToolbar={openToolbar}>
        <EditorContextProvider editor={editor} value={value} valueHandler={valueHandler}>
          {ui}
        </EditorContextProvider>
      </AppBarContextProvider>
    </QueryClientProvider>
  );

  const router = createMemoryRouter([{ path: '/', element: wrappedUI }], { initialEntries: ['/'] });
  return render(<RouterProvider router={router} />, renderOptions);
};

describe('SlateInputField component', () => {
  let component = null as any;
  let providerProps = null as any;

  beforeEach(() => {
    component = (
      <ThemeProvider theme={theme}>
        <SlateInputField />
      </ThemeProvider>
    );
    providerProps = {
      openToolbar: false,
      value: [{ children: [{ text: '' }] }],
    };
  });

  afterEach(() => {
    component = null;
    providerProps = null;
    cleanup();
  });

  test('SlateInputField should render properly', async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderWithRouter(component);
    });
  });

  test('SlateInputField should render properly in contexts', async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      customSlatInputFieldRender(component, { providerProps });
    });
    expect(screen.getByTestId('slate-editor')).toBeTruthy();
  });
});
