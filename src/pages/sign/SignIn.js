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
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      requestData: {
        email: "",
        // password: "",
      },
      failedLoginAttempts: 0,
      errors: {
        email: "",
        // password: "",
      },
    };
  }

  handleChange = (value, path) => {
    const { requestData, errors } = this.state;
    _.set(requestData, path, value);
    _.unset(errors, path, value);
    this.setState({
      requestData,
      errors,
    });
  };

  signIn = async (ev) => {
    ev.preventDefault();
    const { requestData } = this.state;
    this.setState({ loading: true });
    const { payload } = await this.props.signInRequest(
      requestData.email,
      requestData.password
    );
    this.setState({ loading: false });
    const { data = {} } = payload;
    if (data.status !== "ok") {
      if (!data.message.includes("confirmed")) {
        this.setState({
          failedLoginAttempts: this.state.failedLoginAttempts + 1,
        });
      }

      if (this.state.failedLoginAttempts === 3) {
        await this.props.forgotPasswordRequest(
          requestData.email,
          `${origin}/sign/reset-password`
        );
      }
      // if (this.state.failedLoginAttempts < 3) {
      //   toast.dismiss(this.toast);
      //   this.toast = toast.error(data.message || 'Invalid email or password');
      // }

      this.setState({ loading: false });
    }
  };
  validate = (name, value) => {
    const { requestData } = this.state;
    switch (name) {
      case "email":
        if (!value) {
          return " ";
        } else if (
          !value.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)
          
        ) {
          return " ";
        } else {
          return "";
        }
    //   case "password":
    //     if (!value) {
    //       return "Invalid email or password";
    //     } else if (value.length < 8 || value.length > 15) {
    //       return " ";
    //     } else if (!value.match(/[a-z]/g)) {
    //       return " ";
    //     } else if (!value.match(/[A-Z]/g)) {
    //       return " ";
    //     } else if (!value.match(/[0-9]/g)) {
    //       return " ";
    //     } else {
    //       return "";
    //     }
    //   default: {
    //     return "";
    //   }
     }
  };
  handleChange = (e) => {
    this.setState({
      errors: {
        ...this.state.errors,
        [e.target.name]: this.validate(e.target.name, e.target.value),
      },
      requestData: {
        ...this.state.requestData,
        [e.target.name]: e.target.value,
      },
    });
  };

  handleSubmit = (e) => {
    const { requestData } = this.state;
    // e.preventDefault();
    let validationErrors = {};
    Object.keys(requestData).forEach((name) => {
      const error = this.validate(name, requestData[name]);
      if (error && error.length > 0) {
        validationErrors[name] = error;
      }
    });
    if (Object.keys(validationErrors).length > 0) {
      this.setState({ errors: validationErrors });
      return;
    }
  };
  render() {
    const { requestData, errors, failedLoginAttempts } = this.state;
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
                className={`InputIvalid ${
                  errors.email ? "border-error" : null
                }`}
                type="email"
                placeholder="E-mail"
                value={requestData.email}
                error={errors.email}
                onChange={this.handleChange}
                autoComplete="off"
              />

              <PasswordInput
                name="password"
                className="InputIvalid"
                // className={`InputIvalid ${
                //   errors.password ? "border-error" : null
                // }`}
                placeholder="Password"
                value={requestData.password}
                // error={errors.password}
                onChange={this.handleChange}
              />

              <Link to="/sign/forgot-password" className="forgotPassword">
                Forgot password?
              </Link>

              {failedLoginAttempts >= 3 && (
                <p className="errorRecovery">
                  {/* <i class="fa fa-exclamation-triangle"></i> */}
                    Please check your email to recover your account
                </p>
              )}
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
