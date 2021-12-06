import { cleanup, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { mount } from 'enzyme';
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
    initialEntries = [route],
  } = {},
) => {
  const wrapper = (
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        { component }
      </MemoryRouter>
    </Provider>
  );

  return mount(wrapper);
};

export default renderWithRedux;
