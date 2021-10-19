import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { ReactComponent as LogoSvg } from '../../assets/images/araks_logo.svg';
import { forgotPasswordRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';
import OAuthButtonFacebook from '../../components/account/OAuthButtonFacebook';
import OAuthButtonGoogle from '../../components/account/OAuthButtonGoogle';
import OAuthButtonLinkedin from '../../components/account/OAuthButtonLinkedin';
import OAuthButtonTwitter from '../../components/account/OAuthButtonTwitter';

class ForgotPassword extends Component {
  static propTypes = {
    forgotPasswordRequest: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        email: '',
      },
      errors: {
        email: '',
      },
    };
  }

  handleChange = (e) => {
    const { requestData, errors } = this.state;
    this.setState({
      errors: {
        ...errors,
        [e.target.name]: this.validate(e.target.name, e.target.value),
      },
      requestData: {
        ...requestData,
        [e.target.name]: e.target.value,
      },
    });
  };

  resetPassword = async (ev) => {
    ev.preventDefault();

    this.setState({ loading: true });

    const { requestData } = this.state;

    const validationErrors = {};
    Object.keys(requestData).forEach((name) => {
      const error = this.validate(name, requestData[name]);
      if (error && error.length > 0) {
        validationErrors[name] = error;
      }
    });
    if (Object.keys(validationErrors).length > 0) {
      this.setState({ errors: validationErrors });
    }

    const { origin } = window.location;

    const { payload: { data } } = await this.props.forgotPasswordRequest(
      requestData.email,
      `${origin}/sign/reset-password`,
    );

    this.setState({ loading: false });

    if (data.status === 'ok') {
      this.props.history.replace(origin)
    }
  };

  validate = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) {
          return 'Email is Required';
        } if (
          !value.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
        ) {
          return 'Enter a valid email address';
        }
        return '';

      default: {
        return '';
      }
    }
  };

  render() {
    const { token } = this.props;
    const { requestData, loading, errors } = this.state;
    if (token) {
      return <Redirect to="/" />;
    }

    return (
      <WrapperSign>
        <div className="forgotPasswordLeft forgotPassword" />
        <div className="forgotPasswordRight">
          <div>
            <Link to="/">
              <LogoSvg className="logo white" />
            </Link>
          </div>
          <div>
            <form
              onSubmit={this.resetPassword}
              id="login"
              className="forgotPasswordAuthform"
            >
              <div className="forgotPasswordText">
                <h4>Forgot your password?</h4>
              </div>
              <Input
                className={`${
                  errors.email ? 'border-error' : null
                }`}
                name="email"
                type="email"
                placeholder="E-mail"
                value={requestData.email}
                onChange={this.handleChange}
                error={errors.email}
                autoComplete="off"
              />
              <div className="row">
                <Button
                  type="submit"
                  className="submit"
                  color="blue"
                  loading={loading}
                >
                  Reset
                </Button>
              </div>
              <div>
                <p>Sign in using</p>
              </div>
              <div className="socialButtons">
                <OAuthButtonFacebook />
                <OAuthButtonGoogle />
                <OAuthButtonLinkedin />
                <OAuthButtonTwitter />
              </div>
            </form>
            <p className="switchForgotMode">
              <span> Don`t have an admin yet? </span>
              <Link to="/sign/sign-up" className="getstart">
                <i>Get started</i>
              </Link>
            </p>
          </div>
        </div>
      </WrapperSign>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.account.token,
});

const mapDispatchToProps = {
  forgotPasswordRequest,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);

export default Container;
