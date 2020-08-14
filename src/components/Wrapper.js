import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import OfflineIndicator from './OfflineIndicator';
import Loading from './Loading';

Modal.setAppElement(document.body);

class Wrapper extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    token: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    className: PropTypes.string,
  }

  static defaultProps = {
    className: undefined,
  }

  render() {
    const {
      className, children, token, isLoading,
    } = this.props;
    if (!token) {
      return (<Redirect to="/sign/sign-in" />);
    }
    return (
      <main className={className}>
        {children}
        {isLoading ? (
          <Loading className="mainLoading" size={50} />
        ) : null}
        <OfflineIndicator />
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
