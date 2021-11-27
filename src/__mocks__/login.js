import { createSlice } from '@reduxjs/toolkit';
import Account from '../helpers/Account';

const initialState = {
  // status: '',
  token: Account.getToken(),
  myAccount: Account.get(),
  // user: {},
  // findUser: {},
  // userSearch: [],
};

const todosSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    todoAdded(state = initialState, action) {
      const { token = '', user: myAccount } = action.payload.data;
      Account.set(myAccount);
      Account.setToken(token);
      state.push(
        token,
        myAccount,
      );
    },
  },
});

export const { todoAdded } = todosSlice.actions;

export default todosSlice.reducer;
