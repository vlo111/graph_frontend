import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import OfflineIndicator from './OfflineIndicator';

class WrapperSign extends Component {
  render() {
    const { children, token } = this.props;
    if (token) {
      return (<Redirect to="/" />);
    }
    return (
      <main>
        {children}
        <OfflineIndicator />
        <ToastContainer hideProgressBar />
      </main>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.account.token,
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WrapperSign);

export default Container;
