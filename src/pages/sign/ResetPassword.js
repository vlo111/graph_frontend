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
// import Validate from '../../helpers/Validate';

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

  handleTextChange = (e) => {
    const { errors, requestData } = this.state;
    _.set(requestData);
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

  signIn = async (ev) => {
    ev.preventDefault();
    const { requestData } = this.state;
    const { token } = queryString.parse(window.location.search);
    const { payload } = await this.props.resetPasswordRequest(token, requestData.password && requestData.passwordConfirm);
    const { data = {} } = payload;
    if (data.status !== 'ok') {
      toast.dismiss(this.toast);
      this.setState({ errors: data.errors || {} });
      this.toast = toast.error(data.message);
      return;
    }
    this.props.history.push('/');
  }

  validate = (name, value) => {
    const { requestData } = this.state;
    switch (name) {
      case 'password':
        if (!value) {
          return 'Password is required';
        } if (value.length < 8 || value.length > 15) {
          return 'Please fill at least 8 character';
        } if (!value.match(/[a-z]/g)) {
          return 'Please enter at least lower character.';
        } if (!value.match(/[A-Z]/g)) {
          return 'Please enter at least upper character.';
        } if (!value.match(/[0-9]/g)) {
          return 'Please enter at least one digit.';
        }
        return '';

      case 'passwordConfirm':
        if (!value) {
          return 'Confirm password is required';
        } if (value !== requestData.password) {
          return 'Password and confirm password must be same';
        }
        return '';

      default: {
        return '';
      }
    }
  };

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
              <div className="forgotPasswordText">
                <h1>Reset Password </h1>
              </div>

              <PasswordInput
                name="password"
                className={`${
                  errors.password ? 'border-error' : null
                }`}
                placeholder="Password"
                value={requestData.password}
                error={errors.password}
                onChange={this.handleTextChange}
                autoComplete="off"
                showIcon={(!!requestData.password)}
              />

              <PasswordInput
                name="passwordConfirm"
                className={`${
                  errors.passwordConfirm ? 'border-error' : null
                }`}
                placeholder="Confirm password"
                value={requestData.passwordConfirm}
                error={errors.password}
                onChange={this.handleTextChange}
                autoComplete="off"
                showIcon={(!!requestData.passwordConfirm)}
              />
              <Button
                color="blue"
                className="submit"
                type="submit"
              >
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
