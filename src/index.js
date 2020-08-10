import 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware } from 'redux';
import './helpers/Promise.allValues';
import App from './App';
import * as serviceWorker from './serviceWorker';
import reducers from './store/reducers';
import { requestMiddleware } from './helpers/redux-request';

import 'react-toastify/dist/ReactToastify.css';
import 'react-input-range/lib/css/index.css';
import 'react-datasheet/lib/react-datasheet.css';
import 'react-image-crop/lib/ReactCrop.scss';
import './assets/styles/font-awesome.css';
import './assets/styles/style.scss';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducers,
  composeEnhancers(applyMiddleware(requestMiddleware)),
);
window.store = store;

requestMiddleware.on.fail = ((err) => {
  if (err.response) {
    return err.response;
  }
  throw err;
});

ReactDOM.render((
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
