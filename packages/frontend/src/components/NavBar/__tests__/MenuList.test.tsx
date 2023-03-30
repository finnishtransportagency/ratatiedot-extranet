import { render, screen } from '@testing-library/react';
import renderer, { act } from 'react-test-renderer';
import { MenuContextProvider } from '../../../contexts/MenuContext';
import { MenuList } from '../MenuList';

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

test('MenuList renders properly', () => {
  render(<MenuList />);
});

test('MenuList matches snapshot', () => {
  const menuList = renderer.create(<MenuList />).toJSON();
  expect(menuList).toMatchSnapshot();
});

test('MenuList, open a menu and check that new item is visible', async () => {
  // const view =
  render(
    <MenuContextProvider>
      <MenuList />
    </MenuContextProvider>,
  );
  // TODO: Replace closest with something better to fix linter error
  const charts = screen.getByText('Kaaviot').closest('li'); // eslint-disable-line testing-library/no-node-access
  act(() => {
    // Open Kaaviot
    charts?.click();
  });
  const lineCharts = screen.getByText('Linjakaaviot').closest('a'); // eslint-disable-line testing-library/no-node-access
  expect(lineCharts).toBeVisible();
  expect(lineCharts).toHaveAttribute('href', '/kaaviot/linjakaaviot');
});
