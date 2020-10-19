import { createSelector } from 'reselect';

export const getUserFriends = (state) => state.userFriends;

export const friendsList = createSelector(
  getUserFriends,
  (items) => items.myFriends,
);
