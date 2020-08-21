import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link, Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
import { forgotPasswordRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';

class ForgotPassword extends Component {
  static propTypes = {
    forgotPasswordRequest: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      requestData: {
        email: '',
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
    const { origin } = window.location;
    this.setState({ loading: true });
    const { payload } = await this.props.forgotPasswordRequest(requestData.email, `${origin}/sign/reset-password`);
    this.setState({ loading: false });
    const { data = {} } = payload;
    if (data.status !== 'ok') {
      toast.dismiss(this.toast);
      this.toast = toast.error('Invalid email');
      return;
    }
    this.toast = toast.info('Please check your email');
  }

  render() {
    const { token } = this.props;
    const { requestData } = this.state;
    if (token) {
      return (<Redirect to="/" />);
    }
    return (
      <WrapperSign>
        <div className="left forgotPassword">
          <Link to="/">
            <LogoSvg className="logo white" />
          </Link>
        </div>
        <div className="right">
          <div>
            <form onSubmit={this.signIn} id="login" className="authForm">
              <h1>Sign in to</h1>
              <LogoSvg className="logo orange" />
              <div className="forgotPasswordText">
                <h4>Forgot your password?</h4>
                <p>We’ll help you reset it and get back on track.?</p>
              </div>
              <Input
                name="email"
                type="email"
                label="Email address"
                value={requestData.email}
                onChangeText={this.handleTextChange}
              />

              <div className="row">
                <Link to="/sign/sign-in" className="forgotPasswordBack">Back</Link>
                <Button type="submit" className="submit" color="blue">
                  Reset Password
                </Button>
              </div>
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
  forgotPasswordRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ForgotPassword);

export default Container;
