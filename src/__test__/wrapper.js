import { cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import React from 'react';
import { mount } from 'enzyme';
import store from '../store';

afterEach(cleanup);

/**
 * this is a handy function that we normally make available for all tests
 * that deal with connected components.
 * we can provide the entire store that the component is rendered with
 * @param component
 */
const renderWithRedux = (component) => {
  const wrapper = (
    <Provider store={store}>
      { component }
    </Provider>
  );

  return mount(wrapper);
};

export default renderWithRedux;
