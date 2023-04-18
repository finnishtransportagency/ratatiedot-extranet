import { cleanup, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { createEditor } from 'slate';
import { createEditorWithPlugins, EditorContextProvider } from '../../../contexts/EditorContext';

import { SlateInputField } from '../SlateInputField';
import { theme } from '../../../styles/createTheme';
import { AppBarContextProvider } from '../../../contexts/AppBarContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/',
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: () => jest.fn(),
}));

const customSlatInputFieldRender = (ui: any, { providerProps, ...renderOptions }: any) => {
  const { openToolbar = false } = providerProps;
  const {
    editor = createEditorWithPlugins(createEditor()),
    value = [{ children: [{ text: '' }] }],
    valueHandler = () => {},
  } = providerProps;
  return render(
    <AppBarContextProvider openToolbar={openToolbar}>
      <EditorContextProvider editor={editor} value={value} valueHandler={valueHandler}>
        {ui}
      </EditorContextProvider>
    </AppBarContextProvider>,
    renderOptions,
  );
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

  test('SlateInputField should render properly', () => {
    render(component);
  });

  test('SlateInputField should render properly in contexts', () => {
    customSlatInputFieldRender(component, { providerProps });
    expect(screen.getByTestId('slate-editor')).toBeTruthy();
  });
});
