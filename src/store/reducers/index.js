import { combineReducers } from 'redux';
import app from './app';
import account from './account';
import graphs from './graphs';
import shareGraphs from './shareGraphs';

export default combineReducers({
  app,
  account,
  graphs,
  shareGraphs,
});
