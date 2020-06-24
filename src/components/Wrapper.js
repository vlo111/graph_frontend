import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import OfflineIndicator from './OfflineIndicator';
import Header from "./Header";

Modal.setAppElement(document.body);

class Wrapper extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    token: PropTypes.string.isRequired,
    showHeader: PropTypes.bool,
    showFooter: PropTypes.bool,
    className: PropTypes.string,
  }

  static defaultProps = {
    showHeader: true,
    showFooter: true,
    className: undefined,
  }

  render() {
    const { className, children, token, showHeader } = this.props;
    if (!token) {
      return (<Redirect to="/sign/sign-in" />);
    }
    return (
      <main className={className}>
        {showHeader ? <Header /> : null}
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
)(Wrapper);

export default Container;
