import { combineReducers } from 'redux';
import app from './app';
import account from './account';
import graph from './graph';

export default combineReducers({
  app,
  account,
  graph,
});
