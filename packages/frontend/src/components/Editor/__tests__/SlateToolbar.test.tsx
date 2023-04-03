import { ThemeProvider } from '@mui/material';
import { cleanup, render, screen } from '@testing-library/react';
import renderer from 'react-test-renderer';

import { theme } from '../../../styles/createTheme';
import { SlateToolbar } from '../SlateToolbar';

describe('SlateToolbar component', () => {
  let component = null as any;
  beforeEach(() => {
    component = (
      <ThemeProvider theme={theme}>
        <SlateToolbar />
      </ThemeProvider>
    );
  });

  afterEach(() => {
    component = null;
    cleanup();
  });

  test('SlateToolbar should render properly', () => {
    render(component);
  });

  test('SlateToolbar should match snapshot', () => {
    const slateToolbar = renderer.create(component).toJSON();
    expect(slateToolbar).toMatchSnapshot();
  });

  test('SlateToolbar should have a list of control buttons', () => {
    render(component);
    expect(screen.getByRole('button', { name: /paragraph-two/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /paragraph-one/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /heading-two/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /underlined/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /numbered-list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bulleted-list/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /insert-link/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /info/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /warning/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /error/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /check/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /close/i })).toBeInTheDocument();
  });
});
