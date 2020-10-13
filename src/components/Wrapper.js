import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import OfflineIndicator from './OfflineIndicator';
import Loading from './Loading';
import { getMyAccountRequest } from "../store/actions/account";
import Utils from "../helpers/Utils";

Modal.setAppElement(document.body);

class Wrapper extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    token: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    className: PropTypes.string,
    auth: PropTypes.bool,
  }

  static defaultProps = {
    auth: true,
    className: undefined,
  }

  componentDidMount() {
    const { auth } = this.props;
    if (auth) {
      this.props.getMyAccountRequest();
    }
  }


  render() {
    const {
      className, children, token, isLoading, auth,
    } = this.props;
    if (!token && auth && !Utils.isInEmbed()) {
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

const mapDispatchToProps = {
  getMyAccountRequest
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Wrapper);

export default Container;
