import React from 'react';
import { Provider } from 'react-redux';
import {
  applyMiddleware, combineReducers, compose, createStore,
} from 'redux';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import thunkMiddleware from 'redux-thunk';
import { requestMiddleware } from './helpers/redux-request';
import app from './store/reducers/app';
import graphs from './store/reducers/graphs';
import notifications from './store/reducers/notifications';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default (
  component,
  {
    accountReducer,
    store =
    createStore(combineReducers({
      app,
      account: accountReducer,
      graphs,
      notifications,
    }, composeEnhancers(applyMiddleware(thunkMiddleware, requestMiddleware)))),
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
) => ({
  ...render(
    <Provider store={store}>
      <Router history={history}>{ component }</Router>
    </Provider>,
  ),
  store,
});
