import { createSelector } from 'reselect';

export const getAccount = (state) => state.account;

export const getId = createSelector(
  getAccount,
  (items) => items.myAccount.id,
);
