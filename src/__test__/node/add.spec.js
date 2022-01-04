import React from 'react';
import { screen } from '@testing-library/react';
import render from '../render';
import signUp from '../__mocks__/signUp';
import RouterComponent from '../RouterComponent';
import {
  GET_MY_ACCOUNT, GET_USER_BY_TEXT, OAUTH, SIGN_IN, UPDATE_MY_ACCOUNT,
} from '../store/actions/account';
import Account from '../../helpers/Account';

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

  beforeEach(async () =>
  {
    // const { user, token } = await signUp();

    const initialState = {
      status: '',
      token: '',
      myAccount: {},
      user: {},
      findUser: {},
      userSearch: [],
    };

    const accountReducer = (state = initialState, action) => {
      switch (action.type) {
        case SIGN_IN.REQUEST: {
          Account.delete();
          return state;
        }
        case OAUTH.SUCCESS:
        case SIGN_IN.SUCCESS: {
          const { token, user: myAccount } = action.payload.data;
          Account.set(myAccount);
          Account.setToken(token);
          return {
            ...state,
            token,
            myAccount,
          };
        }
        case UPDATE_MY_ACCOUNT.SUCCESS:
        case GET_MY_ACCOUNT.SUCCESS: {
          const { user: myAccount } = action.payload.data;
          Account.set(myAccount);
          return {
            ...state,
            myAccount,
          };
        }
        case GET_MY_ACCOUNT.FAIL: {
          const { status } = action.payload;
          if (status === 401 || status === 403) {
            Account.delete();
            window.location.reload();
          }
          return state;
        }
        case GET_USER_BY_TEXT.REQUEST:
        case GET_USER_BY_TEXT.FAIL: {
          return {
            ...state,
            userSearch: [],
            status: 'request',
          };
        }
        case GET_USER_BY_TEXT.SUCCESS: {
          const { data } = action.payload.data;
          return {
            ...state,
            userSearch: data,
            status: 'success',
          };
        }
        default: {
          return state;
        }
      }
    };

    ({ container } = render(<RouterComponent />, {
      accountReducer,
      route: '/',
    }));
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
