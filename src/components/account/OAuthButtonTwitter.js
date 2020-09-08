import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { oAuthRequest } from '../../store/actions/account';
import twitterImg from '../../assets/images/icons/twitter.svg';
import Api from '../../Api';
import Utils from "../../helpers/Utils";
import queryString from "query-string";

class OAuthButtonTwitter extends Component {
  static propTypes = {
    oAuthRequest: PropTypes.func.isRequired,
  }

  handleClick = async () => {
    const redirectUri = `${window.location.origin}/sign/oauth/twitter`;
    const { data: { data: { oAuthToken } } } = await Api.getTwitterToken({ redirectUri });
    if (!oAuthToken) {
      toast.error('Something went wrong');
      return;
    }
    const win = Utils.popupWindow(`https://api.twitter.com/oauth/authenticate?oauth_token=${oAuthToken}`, 'Linkedin', 450, 600);
    this.timeout = setInterval(() => {
      try {
        const { search, pathname } = win.location;
        const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = queryString.parse(search);
        if (pathname.endsWith('/twitter') && oauthToken) {
          win.close();
          clearTimeout(this.timeout);
          this.props.oAuthRequest('twitter', { oauthToken, oauthVerifier, redirectUri });
        }
      } catch (e) {
        //
      }
    }, 1000);
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
