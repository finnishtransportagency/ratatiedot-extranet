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
    expect(screen.getByRole('button', { name: /kappale normaalilla tekstikoolla/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kappale isommalla tekstikoolla/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pienempi otsikko/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iso otsikko/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lihavoitu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kursivoitu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alleviivattu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /numeroitu lista/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /numeroimaton lista/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Lisää linkki/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /väri/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /info/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /varoitus/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /virhe/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /oikein-merkki/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Poista/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Sulje/i })).toBeInTheDocument();
  });
});
