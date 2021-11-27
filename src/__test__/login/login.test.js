import renderWithRedux from '../redux';
import Tabs from "../../components/tabs";

it('www', () => {
  const { getByTestId } = renderWithRedux(<Tabs />);
});
