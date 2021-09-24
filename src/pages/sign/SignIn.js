import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { ReactComponent as LogoSvg } from "../../assets/images/araks_logo.svg";
import {
  forgotPasswordRequest,
  signInRequest,
} from "../../store/actions/account";
import WrapperSign from "../../components/WrapperSign";
import Input from "../../components/form/Input";
import Button from "../../components/form/Button";
import OAuthButtonFacebook from "../../components/account/OAuthButtonFacebook";
import OAuthButtonGoogle from "../../components/account/OAuthButtonGoogle";
import OAuthButtonLinkedin from "../../components/account/OAuthButtonLinkedin";
import OAuthButtonTwitter from "../../components/account/OAuthButtonTwitter";
import PasswordInput from "../../components/form/PasswordInput";

class Login extends Component {
  static propTypes = {
    signInRequest: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      requestData: {
        email: '',
        password: '',
      },
      failedLoginAttempts: 0,
      errors: ''
    };
  }

  
  handleTextChange = (value, path) => {
    const { requestData } = this.state;
    _.set(requestData, path, value);
    this.setState({ requestData });
  }

  signIn = async (ev) => {
    ev.preventDefault();
    const { requestData } = this.state;

    const errorMessage = "Invalid Email or Password";

    if(!requestData.email || !requestData.password) {
      this.setState({
        errors: errorMessage,
      })
      return;
    }

    this.setState({ loading: true });
    const { payload } = await this.props.signInRequest(requestData.email, requestData.password);
    this.setState({ loading: true });
    const { data = {} } = payload;
    if (data.status !== 'ok') {
      this.setState({
        failedLoginAttempts: this.state.failedLoginAttempts + 1,
        errors: errorMessage + '',
      });
     
       
      if (this.state.failedLoginAttempts === 3) {
        await this.props.forgotPasswordRequest(requestData.email, `${origin}/sign/reset-password`);
      } 
    
    }
  }
  render() {
    const { requestData, failedLoginAttempts, errors } = this.state;
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
            <form onSubmit={this.signIn} id="login" className="SigninAuthForm ">
              <div className="socialLogin">
                <h4>Sign in </h4>
              </div>
               <Input
                name="email"
                placeholder="Email address"
                value={requestData.email}
                onChangeText={this.handleTextChange}
                autoComplete="off"
              />
              <PasswordInput
                name="password"
                placeholder="Password"
                value={requestData.password}
                onChangeText={this.handleTextChange}
              />

              <Link to="/sign/forgot-password" className="forgotPassword">
                Forgot password?
              </Link>

              {
              
              
              failedLoginAttempts >= 3 ? (
                <p className="errorRecovery">
                    Please check your email to recover your account
                </p>
              ) : 
              (errors && (failedLoginAttempts <= 3) && (
                <p className="errorRecovery">
                    {errors}
                </p>
                
              ))
              }

              <Button
                type="submit"
                className="submit"
                color="orange"
                onClick={this.handleSubmit}
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
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  signInRequest,
  forgotPasswordRequest,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(Login);

export default Container;


