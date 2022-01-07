import {
  GET_MY_ACCOUNT, GET_USER_BY_TEXT, OAUTH, SIGN_IN, UPDATE_MY_ACCOUNT,
} from '../actions/account';
import Account from '../../../helpers/Account';

export default (user) => {
  const initialState = {
    status: '',
    token: 'test',
    myAccount: user,
    user,
    findUser: {},
    userSearch: [],
    currentUserId: user.id,
  };

  return (state = initialState, action) => {
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
};
