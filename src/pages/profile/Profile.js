import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { toast } from 'react-toastify';
import Button from '../../components/form/Button';
import { updateMyAccountRequest } from '../../store/actions/account';
import Input from '../../components/form/Input';
import AvatarUploader from "../../components/AvatarUploader";

class Profile extends Component {
  initValues = memoizeOne((requestData) => {
    this.setState({ requestData });
  })

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        lastName: '',
        firstName: '',
        oldPassword: '',
        password: '',
        repeatPassword: '',
      },
      changePassword: false,
      errors: {},
    };
  }

  handleChange = (value, path) => {
    const { requestData, errors } = this.state;
    _.set(requestData, path, value);
    _.unset(errors, path, value);
    this.setState({ requestData, errors });
  }

  saveAccount = async (ev) => {
    ev.preventDefault();
    const { requestData } = this.state;

    const { payload: { data } } = await this.props.updateMyAccountRequest(requestData);
    if (data.status === 'ok') {
      this.toggleChangePassword(false);
      toast.info('Successfully saved');
    } else if (data?.errors) {
      this.setState({ errors: data.errors });
    } else {
      toast.error('Something went wrong');
    }
  }

  toggleChangePassword = (changePassword) => {
    const { requestData } = this.state;

    requestData.oldPassword = '';
    requestData.password = '';
    requestData.repeatPassword = '';

    this.setState({ requestData, changePassword });
  }

  render() {
    const { errors, requestData, changePassword } = this.state;
    const { myAccount } = this.props;
    this.initValues(myAccount);
    return (
      <div className="profileSettings">
        <form onSubmit={this.saveAccount}>
          <div className="left">
            <AvatarUploader value={myAccount.avatar} onChange={(val) => this.handleChange(val, 'avatar')} />
          </div>
          <div className="right">
            <div className="row">
              <Input
                name="firstName"
                label="First Name"
                value={requestData.firstName}
                error={errors.firstName}
                onChangeText={this.handleChange}
                containerClassName="firstName"
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
                name="bio"
                label="Short description/ bio"
                containerClassName="bio"
                textArea
                value={requestData.bio}
                error={errors.bio}
                onChangeText={this.handleChange}
              />
            </div>
            <div className="row">
              <Input
                name="website"
                label="Website"
                type="url"
                value={requestData.website}
                error={errors.website}
                onChangeText={this.handleChange}
              />
            </div>
            <Button className="changePassword" onClick={() => this.toggleChangePassword(!changePassword)}>
              Change Password
            </Button>
            {changePassword ? (
              <div className="changePasswordWrapper">
                <Input
                  name="oldPassword"
                  label="Old Password"
                  type="password"
                  value={requestData.oldPassword}
                  error={errors.oldPassword}
                  onChangeText={this.handleChange}
                />
                <div className="row">
                  <Input
                    name="password"
                    label="New Password"
                    type="password"
                    containerClassName="newPassword"
                    value={requestData.password}
                    error={errors.password}
                    onChangeText={this.handleChange}
                  />
                  <Input
                    name="repeatPassword"
                    label="Repeat Password"
                    type="password"
                    value={requestData.repeatPassword}
                    error={errors.repeatPassword}
                    onChangeText={this.handleChange}
                  />
                </div>

              </div>
            ) : null}

            <Button className="save" color="accent" type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  myAccount: state.account.myAccount,
});

const mapDispatchToProps = {
  updateMyAccountRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Profile);

export default Container;
