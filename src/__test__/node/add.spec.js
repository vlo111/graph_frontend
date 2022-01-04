import React from 'react';
import { screen } from '@testing-library/react';
import render from '../render';
import signUp from '../__mocks__/signUp';
import RouterComponent from '../RouterComponent';
import account from '../store/reducers/account';

describe('React Router', () => {
  let container;
  //
  // const form = (id) => container.querySelector(`form[id="${id}"]`);
  //
  // const field = (name) => form('login').elements[name];
  //
  // const expectToBeInputFieldOfTypeText = (formElement, type) => {
  //   expect(formElement).not.toBeNull();
  //   expect(formElement.tagName).toEqual('INPUT');
  //   expect(formElement.type).toEqual(type);
  // };
  //
  // const itRendersAsATextBox = (fieldName, type) => it('renders as a text box', () => {
  //   expectToBeInputFieldOfTypeText(field(fieldName), type);
  // });

  beforeEach(async () => {
    const { user } = await signUp();

    try {
      ({ container } = render(<RouterComponent />, {
        account: account(user),
        route: '/graphs/update/635005e2-1ecd-42b6-a189-9c765f2dac15',
      }));
    } catch (e) {
      console.log('rrrrrrrr -- ', e);
    }
  });

  // itRendersAsATextBox('email', 'text');
  //
  // itRendersAsATextBox('password', 'password');

  it('should render the home page', async () => {
    // expect(container.innerHTML).toMatch('Forgot password?');

    // ReactTestUtils.Simulate.change(field('email'), {
    //   target: { value: 'fffawf@test.com', name: 'email' },
    // });
    //
    // ReactTestUtils.Simulate.change(field('password'), {
    //   target: { value: 'Test_test1', name: 'password' },
    // });
    //
    // await ReactTestUtils.Simulate.submit(form('login'));

    screen.debug();
  });
});
