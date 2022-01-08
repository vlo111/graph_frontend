import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import {
  getMyAccountRequest, getUsersByTextRequest, oAuthRequest,
} from '../../store/actions/account';
import { requestMiddleware } from '../../helpers/redux-request';
import '../../__mocks__/axios';

const middlewares = [thunk, requestMiddleware];
const mockStore = configureMockStore(middlewares);

/**
 * Asynchronous Action of account object, redux action
 * Creates mock redux store with request Middleware and thunk
 */
describe('redux action of account', () => {
  const expectActions = (type, payload) => [
    {
      payload: {},
      status: 'request',
      type: `${type}_REQUEST`,
    },
    {
      payload,
      status: 'ok',
      type: `${type}_SUCCESS`,
    },
  ];

  const mockValue = (value) => {
    axios.get.mockResolvedValueOnce(value);
  };

  const dispatch = (type, action, payload) => {
    const store = mockStore();

    return store.dispatch(action(payload)).then(() => {
      expect(store.getActions()).toEqual(expectActions(type, payload));
    });
  };

  it('get user account', () => {
    const users = {
      id: 'testId',
      email: 'user@email.com',
    };

    axios.get.mockResolvedValueOnce(users);

    dispatch('GET_MY_ACCOUNT', getMyAccountRequest, users);
  });

  it('get user by text', () => {
    const id = 'test_user_id';

    mockValue(id);

    dispatch('GET_USER_BY_TEXT', getUsersByTextRequest, id);
  });

  it('sign in OAuth request', () => {
    const data = { type: 'oAuth', params: { token: 'tests' } };

    mockValue(data);

    dispatch('OAUTH', oAuthRequest, data);
  });
});
