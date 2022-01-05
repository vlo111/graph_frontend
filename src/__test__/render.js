import { cleanup, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import React from 'react';
import { createMemoryHistory } from 'history';
import store from '../store';

afterEach(cleanup);

/**
 * this is a handy function that we normally make available for all tests
 * that deal with connected components.
 * we can provide the entire store that the component is rendered with
 * @param component
 * @param route
 * @param history
 */
const renderWithRedux = (
  component, {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <Router history={history}>
        {children}
      </Router>
    </Provider>
  );

  return {
    ...render(
      <>{ component }</>,
      { wrapper: Wrapper },
    ),
    history,
  };
};

export default renderWithRedux;
