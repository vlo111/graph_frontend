import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { connect, useDispatch, useSelector } from 'react-redux';
import { ReactComponent as LogoSvg } from '../../assets/images/araks_logo.svg';
import { forgotPasswordRequest, signInRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';
import OAuthButtonFacebook from '../../components/account/OAuthButtonFacebook';
import OAuthButtonGoogle from '../../components/account/OAuthButtonGoogle';
import OAuthButtonLinkedin from '../../components/account/OAuthButtonLinkedin';
import OAuthButtonTwitter from '../../components/account/OAuthButtonTwitter';
import PasswordInput from '../../components/form/PasswordInput';

const Login = () => {
  const dispatch = new useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [errors, setErrors] = useState('');

  const signIn = async (ev) => {
    ev.preventDefault();

    const errorMessage = 'Invalid Email or Password';

    if (!email || !password) {
      setErrors(errorMessage);
      return;
    }

    const { payload } = await dispatch(signInRequest(email, password));
    const { data = {} } = payload;
    if (data.status !== 'ok') {
      setFailedLoginAttempts(failedLoginAttempts + 1);
      setErrors(errorMessage);

      if (failedLoginAttempts === 3) {
        await dispatch(forgotPasswordRequest(email, `${origin}/sign/reset-password`));
      }
    }
  };

  return (
    <WrapperSign>
      <div className="SigninLeft signIn" />
      <div className="Signinright">
        <div className="SaytLogo">
          <Link to="/">
            <LogoSvg className="logo white" />
          </Link>
        </div>
        <div>
          <form onSubmit={signIn} id="login" className="SigninAuthForm ">
            <div className="socialLogin">
              <h4>Sign in </h4>
            </div>
            <Input
              name="email"
              placeholder="Email address"
              value={email}
              onChangeText={(value) => setEmail(value)}
              autoComplete="off"
            />
            <PasswordInput
              name="password"
              placeholder="Password"
              value={password}
              onChangeText={(value) => setPassword(value)}
              showIcon={(!!password)}
            />
            <Link to="/sign/forgot-password" className="forgotPassword">
              Forgot password?
            </Link>
            {failedLoginAttempts >= 3 ? (
              <p className="errorRecovery">
                Please check your email to recover your account
              </p>
            )
              : (errors && (failedLoginAttempts <= 3) && (
              <p className="errorRecovery">
                {errors}
              </p>
              ))}
            <Button
              type="submit"
              className="submit"
              color="orange"
            >
              Sign In
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
          <p className="switchSignInMode">
            <span> Don't have an admin yet? </span>
            <Link to="/sign/sign-up" className="getstart">
              <i>Get started</i>
            </Link>
          </p>
        </div>
      </div>
    </WrapperSign>
  );
};

export default Login;
