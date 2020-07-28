import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Link, Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
import { signInRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';

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
        <form onSubmit={this.signIn} id="login" className="authForm">
          <LogoSvg width={150} height={150} />
          <Input
            name="email"
            type="email"
            label="Email"
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
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>


          <Button type="submit" color="blue">
            Sign In
          </Button>
          <p>
            {"Don't have an admin yet? "}
            <Link to="/sign/sign-up">Register now</Link>
          </p>
        </form>
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
