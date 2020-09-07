import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import fbImg from '../../assets/images/icons/fb.svg';
import googleImg from '../../assets/images/icons/google.png';
import twitterImg from '../../assets/images/icons/twitter.svg';
import linkedinImg from '../../assets/images/icons/linkedin.svg';
import { oAuthRequest } from '../../store/actions/account';

const { REACT_APP_FACEBOOK_APP_ID } = process.env;

class OAuthButtons extends Component {
  static propTypes = {
    oAuthRequest: PropTypes.func.isRequired,
  }

  componentDidMount() {
    window.fbAsyncInit = () => {
      const { FB } = window;
      FB.init({
        appId: REACT_APP_FACEBOOK_APP_ID,
        xfbml: true,
        version: 'v8.0',
      });
    };
  }

  handleFacebookClick = () => {
    const { FB } = window;

    const redirectUri = `${window.location.origin}/sign/oauth/facebook`;
    FB.getLoginStatus((response) => {
      const { status, authResponse } = response;
      if (status === 'connected') {
        const { accessToken } = authResponse || {};
        if (accessToken) {
          this.props.oAuthRequest('facebook', { accessToken });
          return;
        }
      }
      if (status === 'not_authorized') {
        console.warn(`Auth error: ${status}`);
      }
      FB.login((res) => {
        const { accessToken } = res.authResponse || {};
        if (accessToken) {
          this.props.oAuthRequest('facebook', { accessToken });
        }
      }, { scope: 'public_profile,email', redirect_uri: redirectUri });
    });
  }

  render() {
    return (
      <div className="socialButtons">
        <Helmet>
          <script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js" />
        </Helmet>
        <button type="button" className="button" onClick={this.handleFacebookClick}>
          <img src={fbImg} alt="Facebook" />
          <span>Facebook</span>
        </button>
        <a href="/https://www.google.com/" className="button">
          <img src={googleImg} alt="Google" className="whiteBg" />
          <span>Google</span>
        </a>
        <a href="/https://www.google.com/" className="button">
          <img src={twitterImg} alt="twitter" />
          <span>Twitter</span>
        </a>
        <a
          href="https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={your_client_id}&redirect_uri=https%3A%2F%2Fdev.example.com%2Fauth%2Flinkedin%2Fcallback&state=fooobar&scope=r_liteprofile%20r_emailaddress%20w_member_social"
          className="button">
          <img src={linkedinImg} alt="Linkedin" />
          <span>Linkedin</span>
        </a>
      </div>
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
)(OAuthButtons);

export default Container;
