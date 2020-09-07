import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link, Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
import fbImg from '../../assets/images/icons/fb.svg';
import googleImg from '../../assets/images/icons/google.png';
import { signInRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';
import OAuthButtons from "../../components/account/OAuthButtons";

class Login extends Component {
  static propTypes = {
    signInRequest: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      requestData: {
        email: '',
        password: '',
      },
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
    this.setState({ loading: true });
    const { payload } = await this.props.signInRequest(requestData.email, requestData.password);
    this.setState({ loading: false });
    const { data = {} } = payload;
    if (data.status !== 'ok') {
      toast.dismiss(this.toast);
      this.toast = toast.error('Invalid email or password');
    }
  }

  render() {
    const { token } = this.props;
    const { requestData } = this.state;
    if (token) {
      return (<Redirect to="/" />);
    }
    return (
      <WrapperSign>
        <div className="left signIn">
          <Link to="/">
            <LogoSvg className="logo white" />
          </Link>
        </div>
        <div className="right">
          <div>
            <form onSubmit={this.signIn} id="login" className="authForm">
              <h1>Sign in to</h1>
              <LogoSvg className="logo orange" />
              <div className="socialLogin">
                <h4>Sign in using</h4>
                <OAuthButtons />
              </div>

              <div className="hr">or</div>
              <Input
                name="email"
                type="email"
                label="Email address"
                value={requestData.email}
                onChangeText={this.handleTextChange}
              />
              <Input
                name="password"
                type="password"
                label="Password"
                value={requestData.password}
                onChangeText={this.handleTextChange}
              />
              <Link to="/sign/forgot-password" className="forgotPassword">Forgot password?</Link>

              <Button type="submit" className="submit" color="orange">
                Sign In
              </Button>
            </form>
            <p className="switchSignMode">
              {"Don't have an admin yet? "}
              <Link to="/sign/sign-up">Get started</Link>
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
  signInRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login);

export default Container;
