import { vi, Mock } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import axios from 'axios';

import { MenuContextProvider } from '../../../contexts/MenuContext';
import { AppBarContext } from '../../../contexts/AppBarContext';
import { MenuList } from '../MenuList';

vi.mock('axios');

beforeEach(() => {
  // Mock the favorites API call (MenuContext) to return empty array
  (axios.get as Mock).mockResolvedValue({ data: [] });
});

afterEach(() => {
  vi.clearAllMocks();
});

const mockAppBarContext = {
  openMiniDrawer: true,
  openDesktopDrawer: true,
  toggleMiniDrawer: vi.fn(),
  toggleDesktopDrawer: vi.fn(),
  openSearch: false,
  toggleSearch: vi.fn(),
  openFilter: false,
  toggleFilter: vi.fn(),
  closeFilter: vi.fn(),
  openEdit: false,
  toggleEdit: vi.fn(),
  openToolbar: false,
  openToolbarHandler: vi.fn(),
  closeToolbarHandler: vi.fn(),
  closeToolbarWithoutSaveHandler: vi.fn(),
  userRight: { canRead: false, canWrite: false, isAdmin: false },
  userRightHandler: vi.fn(),
  closeEdit: vi.fn(),
};

const withProviders = (
  <AppBarContext.Provider value={mockAppBarContext}>
    <MenuContextProvider>
      <MenuList />
    </MenuContextProvider>
  </AppBarContext.Provider>
);

const renderWithRouter = (initialEntries = ['/']) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: withProviders,
      },
    ],
    { initialEntries },
  );
  return render(<RouterProvider router={router} />);
};

test('MenuList renders properly', async () => {
  renderWithRouter();
  expect(await screen.findByText('Kaaviot')).toBeInTheDocument();
});

test('MenuList matches snapshot', async () => {
  const { asFragment } = renderWithRouter();
  // Wait for the async state updates of the component to complete, e.g. fetching favorites
  await waitFor(() => {
    expect(screen.getByText('Kaaviot')).toBeInTheDocument();
  });
  expect(asFragment()).toMatchSnapshot();
});

test('MenuList, open a menu and check that new item is visible', async () => {
  renderWithRouter();

  const charts = await screen.findByText('Kaaviot');
  expect(screen.queryByText('Linjakaaviot')).not.toBeInTheDocument();

  await act(async () => {
    charts.click();
  });

  const lineCharts = await screen.findByText('Linjakaaviot');
  expect(lineCharts).toBeVisible();

  const lineChartsLink = screen.getByRole('link', { name: /linjakaaviot/i });
  expect(lineChartsLink).toHaveAttribute('href', '/kaaviot/linjakaaviot');
});
