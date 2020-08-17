import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
import { signUpRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';

class SignUp extends Component {
  static propTypes = {
    signUpRequest: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  }

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
  }

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
  }

  render() {
    const { requestData, errors, loading } = this.state;
    return (
      <WrapperSign>
        <div className="left signIn">
          <Link to="/">
            <LogoSvg className="logo white" />
          </Link>
        </div>
        <div className="right">
          <div>
            <form onSubmit={this.signUp} id="registration" className="authForm">
              <h1>Sign up to</h1>
              <LogoSvg className="logo orange" />
              <Input
                name="firstName"
                label="First Name"
                value={requestData.firstName}
                error={errors.firstName}
                onChangeText={this.handleChange}
              />
              <Input
                name="lastName"
                label="Last Name"
                value={requestData.lastName}
                error={errors.lastName}
                onChangeText={this.handleChange}
              />
              <Input
                name="email"
                type="email"
                label="Email address"
                value={requestData.email}
                error={errors.email}
                onChangeText={this.handleChange}
              />
              <Input
                name="password"
                type="password"
                label="Password"
                value={requestData.password}
                error={errors.password}
                onChangeText={this.handleChange}
              />
              <Input
                name="passwordConfirm"
                type="password"
                label="Confirm Password"
                value={requestData.passwordConfirm}
                error={errors.passwordConfirm}
                onChangeText={this.handleChange}
              />
              <Button color="orange" className="submit" type="submit" loading={loading}>
                Sign Up
              </Button>
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

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignUp);

export default Container;
