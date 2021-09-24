import { createSelector } from 'reselect';

export const getApp = (state) => state.app;

export const getOnlineUsers = createSelector(
  getApp,
  (items) => items.onlineUsers,
); 
export const getMouseTracker = createSelector(
  getApp,
  (items) => items.mouseTracker,
); 
