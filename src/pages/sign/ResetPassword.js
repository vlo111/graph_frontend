import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link, Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
import { resetPasswordRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import Button from '../../components/form/Button';
import PasswordInput from '../../components/form/PasswordInput';

class ResetPassword extends Component {
  static propTypes = {
    resetPasswordRequest: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        password: '',
        passwordConfirm: '',
      },
      errors: {
        password: '',
        passwordConfirm: '',
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
    const { token } = queryString.parse(window.location.search);
    const { payload } = await this.props.resetPasswordRequest(token, requestData.password);
    const { data = {} } = payload;
    if (data.status !== 'ok') {
      toast.dismiss(this.toast);
      this.setState({ errors: data.errors || {} });
      this.toast = toast.error(data.message);
      return;
    }
    this.props.history.push('/');
  }

  render() {
    const { token } = queryString.parse(window.location.search);
    const { requestData, errors } = this.state;
    if (!token) {
      return (<Redirect to="/" />);
    }
    return (
      <WrapperSign>
        <div className="left forgotPassword">
          <Link to="/">
            <LogoSvg className="logo white logoReset" />
          </Link>
        </div>
        <div className="right">
          <div>
            <form onSubmit={this.signIn} id="login" className="authForm">
              <h1>Reset Password</h1>
              <PasswordInput
                placeholder="New password"
                name="password"
                value={requestData.password}
                onChangeText={this.handleTextChange}
                error={errors.password}
              />
              <PasswordInput
                name="passwordConfirm"
                placeholder="Confirm password"
                value={requestData.passwordConfirm}
                error={errors.passwordConfirm}
                onChangeText={this.handleTextChange}
                autoComplete="off"
              />

            <Button disabled={requestData.password.length >= requestData.passwordConfirm.length  } type="submit" className="submit" color="blue">
                Reset
              </Button>
            </form>
          </div>
        </div>

      </WrapperSign>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  resetPasswordRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResetPassword);

export default Container;
