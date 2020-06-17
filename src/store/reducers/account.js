import {
  SIGN_IN, GET_MY_ACCOUNT,
} from '../actions/account';
import Account from '../../helpers/Account';

const initialState = {
  status: '',
  token: Account.getToken(),
  myAccount: Account.get(),
  user: {},
  findUser: {},
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SIGN_IN.REQUEST: {
      Account.delete();
      return state;
    }
    case SIGN_IN.SUCCESS: {
      const { token, user } = action.payload.data;
      Account.set(user);
      Account.setToken(token);
      return {
        ...state,
        token,
        user,
      };
    }
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
    default: {
      return state;
    }
  }
}
