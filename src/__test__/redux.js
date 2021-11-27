import { cleanup, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import Account from '../helpers/Account';
import store from '../store';

afterEach(cleanup);

const initialState = {
  status: '',
  token: Account.getToken(),
  myAccount: Account.get(),
  user: {},
  findUser: {},
  userSearch: [],
};

/**
 * this is a handy function that we normally make available for all tests
 * that deal with connected components.
 * we can provide initialState or the entire store that the component is rendered with
 * @param component
 * @param initialState
 * @param store
 * @returns {*&{store: *}}
 */
const renderWithRedux = (
  component,
) => ({
  ...render(<Provider store={store}>
    renderWithRouter(<App />)}
  </Provider>),
  // adding `store` to the returned utilities to allow us
  // to reference it in our tests (just try to avoid using
  // this to test implementation details).
  store,
});

// this is a handy function that I would utilize for any component
// that relies on the router being in context
function renderWithRouter(
    ui,
    {route = '/', history = createMemoryHistory({initialEntries: [route]})} = {},
) {
  return {
    ...render(<Router history={history}>{ui}</Router>),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  }
}

export default renderWithRedux;
