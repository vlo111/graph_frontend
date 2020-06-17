import { combineReducers } from 'redux';
import app from './app';
import account from './account';

export default combineReducers({
  app,
  account,
});
