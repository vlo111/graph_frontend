import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { oAuthRequest } from '../../store/actions/account';
import linkedinImg from '../../assets/images/icons/linkedin.svg';

const { REACT_APP_LINKEDIN_CLIENT_ID } = process.env;

class OAuthButtonLinkedin extends Component {
  static propTypes = {
    oAuthRequest: PropTypes.func.isRequired,
  }

  componentDidMount() {
    if (window.location.pathname.endsWith('/linkedin')) {
      const { code } = queryString.parse(window.location.search);
      const redirectUri = window.location.origin + window.location.pathname;
      this.props.oAuthRequest('linkedin', { code, redirectUri });
    }
  }

  render() {
    const query = queryString.stringify({
      client_id: REACT_APP_LINKEDIN_CLIENT_ID,
      redirect_uri: `${window.location.origin}/sign/oauth/linkedin`,
      response_type: 'code',
      state: 'fooobar',
      scope: ['r_liteprofile', 'r_emailaddress'].join(' '),
    });
    return (
      <a href={`https://www.linkedin.com/oauth/v2/authorization?${query}`} className="button">
        <img src={linkedinImg} alt="Linkedin" />
        <span>Linkedin</span>
      </a>
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
)(OAuthButtonLinkedin);

export default Container;
