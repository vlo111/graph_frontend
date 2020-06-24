import { combineReducers } from 'redux';
import app from './app';
import account from './account';
import graphs from './graphs';

export default combineReducers({
  app,
  account,
  graphs,
});
