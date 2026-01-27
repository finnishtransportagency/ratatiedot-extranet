import { ThemeProvider } from '@mui/material';
import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { theme } from '../../../styles/createTheme';
import { SlateToolbar } from '../SlateToolbar';

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

describe('SlateToolbar component', () => {
  let component: React.ReactElement;
  beforeEach(() => {
    component = (
      <ThemeProvider theme={theme}>
        <SlateToolbar />
      </ThemeProvider>
    );
  });

  afterEach(() => {
    cleanup();
  });

  test('SlateToolbar should render properly', () => {
    renderWithRouter(component);
  });

  test('SlateToolbar should match snapshot', () => {
    const { asFragment } = renderWithRouter(component);
    expect(asFragment()).toMatchSnapshot();
  });

  test('SlateToolbar should have a list of control buttons', () => {
    renderWithRouter(component);
    const combobox = screen.getByRole('combobox', { name: /Valitse fontin koko/i });
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent(/Leipäteksti/i);
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
    expect(screen.getByRole('img', { name: /Sulje/i })).toBeInTheDocument();
  });
});
