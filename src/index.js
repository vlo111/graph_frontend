import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './helpers/Promise.allValues';
import socketIOClient from 'socket.io-client';
import App from './App';
import * as serviceWorker from './serviceWorker';
import store from './store';
import SocketContext from './context/Socket';

import 'rc-tooltip/assets/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-input-range/lib/css/index.css';
import 'react-datasheet/lib/react-datasheet.css';
import 'react-image-crop/lib/ReactCrop.scss';
import './assets/styles/font-awesome.css';
import './assets/styles/style.scss';

const socket = socketIOClient(process.env.REACT_APP_API_URL);

ReactDOM.render((
  <Provider store={store}>
    <SocketContext.Provider value={socket}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </SocketContext.Provider>
  </Provider>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

window.graphs = {
  version: '0.1.2',
};
