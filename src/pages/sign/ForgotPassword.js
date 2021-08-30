import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Link, Redirect } from "react-router-dom";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { ReactComponent as LogoSvg } from "../../assets/images/araks_logo.svg";
import { forgotPasswordRequest } from "../../store/actions/account";
import WrapperSign from "../../components/WrapperSign";
import Input from "../../components/form/Input";
import Button from "../../components/form/Button";
import OAuthButtonFacebook from "../../components/account/OAuthButtonFacebook";
import OAuthButtonGoogle from "../../components/account/OAuthButtonGoogle";
import OAuthButtonLinkedin from "../../components/account/OAuthButtonLinkedin";
import OAuthButtonTwitter from "../../components/account/OAuthButtonTwitter"; 
class ForgotPassword extends Component {
  static propTypes = {
    forgotPasswordRequest: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      requestData: {
        email: "",
      },
      // required: false
      errors: {
        email: "",
      },
    };
  }

  handleChange = (value, path) => {
    const { requestData, errors } = this.state;
    _.set(requestData, path, value);
    _.unset(errors, path, value);
    this.setState({ requestData, errors });

    //   this.setState({
    //     required: false
    //   })
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

  signIn = async (ev) => {
    ev.preventDefault();
    const { requestData } = this.state;
    const { origin } = window.location;
    this.setState({ loading: true });
    const { payload } = await this.props.forgotPasswordRequest(
      requestData.email,
      `${origin}/sign/reset-password`
    );
    this.setState({ loading: false });
    const { data = {} } = payload;
    // if (data.status !== 'ok') {
    //   // toast.dismiss(this.toast);
    //   // this.toast = toast.error('Invalid email');
    //   toast.error('?? Wow so easy!', { });
    //   return;
    // }
    this.setState({ loading: true });
    if (_.isEmpty(requestData.InputIvalid)) {
      this.setState({
        required: true,
      });
    }
    // this.toast = toast.info('Please check your email');
  };
  validate = (name, value) => {
    const { requestData } = this.state;
    switch (name) {
      case "email":
        if (!value) {
          return "Email is Required";
        } else if (
          !value.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
        ) {
          return "Enter a valid email address";
        } else {
          return "";
        }
      default: {
        return "";
      }
    }
  };
  handleSubmit = (e) => {
    const { requestData } = this.state;
    e.preventDefault();
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
    const { token } = this.props;
    const { requestData, errors } = this.state;
    if (token) {
      return <Redirect to="/" />;
    }
    // toast('?? Wow so easy!', {

    //   });

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
              onSubmit={this.signIn}
              id="login"
              // className="forgotPasswordAuthform"
              className="forgotPasswordAuthform"
            >
              <div className="forgotPasswordText">
                <h4>Forgot your password?</h4>
              </div>
              <Input
                className={`InputIvalid ${
                  errors.email ? "border-error" : null
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
                  onClick={this.handleSubmit}
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
