import React, { Component } from 'react';
import { ToastContainer, Slide as ToastSlide } from 'react-toastify';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import OfflineIndicator from './OfflineIndicator';
import Header from './Header';
import Loading from "./Loading";

Modal.setAppElement(document.body);

class Wrapper extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    token: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
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
    const {
      className, children, token, showHeader, isLoading
    } = this.props;
    if (!token) {
      return (<Redirect to="/sign/sign-in" />);
    }
    return (
      <main className={className}>
        {showHeader ? <Header /> : null}
        {children}
        {isLoading ? (
          <Loading className="mainLoading" size={50} />
        ) : null}
        <OfflineIndicator />
        <ToastContainer hideProgressBar transition={ToastSlide} />
      </main>
    );
  }
}


const mapStateToProps = (state) => ({
  token: state.account.token,
  isLoading: state.app.isLoading,
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Wrapper);

export default Container;
