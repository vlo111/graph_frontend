import React, { Component } from 'react';
import _ from 'lodash';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import VerticalTabs from '../../components/VerticalTabs';
import Input from '../../components/form/Input';
import { connect } from "react-redux";

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        lastName: '',
        firstName: '',
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

  render() {
    const { errors, requestData } = this.state;
    const { myAccount } = this.props;
    return (
      <Wrapper className="account">
        <Header />
        <VerticalTabs tabs={['Profile', 'Settings']}>
          <div className="profileSettings">
            <form action="">
              <div className="left">
                <img src={myAccount.avatar} className="avatar" alt={myAccount.name} />
              </div>
              <div className="right">
                <div className="row">
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
                </div>
                <div className="row">
                  <Input
                    name="firstName"
                    label="Short description/ bio"
                    textArea
                    value={requestData.firstName}
                    error={errors.firstName}
                    onChangeText={this.handleChange}
                  />
                </div>
                <div className="row">
                  <Input
                    name="firstName"
                    label="Website"
                    value={requestData.firstName}
                    error={errors.firstName}
                    onChangeText={this.handleChange}
                  />
                </div>
              </div>
            </form>
          </div>
          <div>
            Settings
          </div>
        </VerticalTabs>
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  myAccount: state.account.myAccount,
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Account);

export default Container;
