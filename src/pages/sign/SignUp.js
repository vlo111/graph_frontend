import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';
import { ReactComponent as LogoSvg } from '../../assets/images/araks_logo.svg';
import { signUpRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import PasswordInput from '../../components/form/PasswordInput';
import OAuthButtonFacebook from '../../components/account/OAuthButtonFacebook';
import OAuthButtonGoogle from '../../components/account/OAuthButtonGoogle';
import OAuthButtonLinkedin from '../../components/account/OAuthButtonLinkedin';
import OAuthButtonTwitter from '../../components/account/OAuthButtonTwitter';

class SignUp extends Component {
  static propTypes = {
    signUpRequest: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        lastName: '',
        firstName: '',
        email: '',
        password: '',
        passwordConfirm: '',
      },
      errors: {},
    };
  }

  handleChange = (value, path) => {
    const { requestData, errors } = this.state;
    _.set(requestData, path, value);
    _.unset(errors, path, value);
    this.setState({ requestData, errors });
  };

  signUp = async (ev) => {
    ev.preventDefault();
    const { requestData } = this.state;
    this.setState({ loading: true });
    const { payload } = await this.props.signUpRequest(requestData);
    const { data = {} } = payload;
    if (data.status === 'ok') {
      this.props.history.push('/sign/sign-in');
      return;
    }
    if (_.isEmpty(data.errors)) {
      toast.error(data.message);
    }

    this.setState({ errors: data.errors || {}, loading: false });
  };

  render() {
    const { requestData, errors, loading } = this.state;
    return (
      <WrapperSign>
        <div className="SignUpLeft signUp">
          <Link to="/" />
        </div>
        <div className="SignUpRight">
          <Link to="/">
            <LogoSvg className="logo white" />
          </Link>
          <div>
            <form
              onSubmit={this.signUp}
              id="registration"
              className="SignUpAuthform"
            >
              <h1>Your ultimate graphing tool</h1>
              <div className="forgotPasswordText">
                <h4>Get started now </h4>
              </div>
              <Input
                name="firstName"
                placeholder="First Name"
                value={requestData.firstName}
                error={errors.firstName}
                onChangeText={this.handleChange}
              />
              <Input
                name="lastName"
                placeholder="Last Name"
                value={requestData.lastName}
                error={errors.lastName}
                onChangeText={this.handleChange}
              />
              <Input
                name="email"
                type="email"
                placeholder="E-mail"
                value={requestData.email}
                error={errors.email}
                onChangeText={this.handleChange}
              />
              <PasswordInput
                name="password"
                placeholder="Password"
                value={requestData.password}
                onChangeText={this.handleChange}
              />
              <PasswordInput
                name="passwordConfirm"
                placeholder="Password Confirm"
                value={requestData.passwordConfirm}
                onChangeText={this.handleChange}
              />
              <Button
                color="orange"
                className="submit"
                type="submit"
                loading={loading}
              >
                Start
              </Button>
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
  signUpRequest,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(SignUp);

export default Container;
