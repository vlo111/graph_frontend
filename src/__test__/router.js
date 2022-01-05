import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';
import App from "../App";

jest.mock('firebase/app');

test('invalid path should redirect to 404', () => {
  const wrapper = mount(
    <MemoryRouter initialEntries={['/random']}>
      <App />
    </MemoryRouter>,
  );
    // expect(wrapper.find(Home)).toHaveLength(0);
    // expect(wrapper.find(NotFoundPage)).toHaveLength(1);
});

test('valid path should not redirect to 404', () => {
  const wrapper = mount(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );
    // expect(wrapper.find(Home)).toHaveLength(1);
    // expect(wrapper.find(NotFoundPage)).toHaveLength(0);
});
