import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import Modal from 'react-modal';
import OfflineIndicator from './OfflineIndicator';

Modal.setAppElement(document.body);

class Wrapper extends Component {
  render() {
    const { children } = this.props;
    return (
      <main>
        {children}
        <OfflineIndicator />
        <ToastContainer hideProgressBar />
      </main>
    );
  }
}

export default Wrapper;
