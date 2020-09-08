import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { oAuthRequest } from '../../store/actions/account';
import twitterImg from '../../assets/images/icons/twitter.svg';
import Api from '../../Api';

class OAuthButtonTwitter extends Component {
  static propTypes = {
    oAuthRequest: PropTypes.func.isRequired,
  }

  handleClick = async () => {
    const redirectUri = `${window.location.origin}/sign/oauth/linkedin`;
    await Api.getTwitterToken({ redirectUri });
  }

  render() {
    return (
      <button type="button" className="button" onClick={this.handleClick}>
        <img src={twitterImg} alt="twitter" />
        <span>Twitter</span>
      </button>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  oAuthRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OAuthButtonTwitter);

export default Container;
