import { render } from '@testing-library/react';
import { MenuList } from '../MenuList';

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

test('MenuList', () => {
  render(<MenuList open={true} />);
});
