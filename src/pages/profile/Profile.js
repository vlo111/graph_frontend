import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import Button from '../../components/form/Button';
import { updateMyAccountRequest } from '../../store/actions/account';
import Input from '../../components/form/Input';
import AvatarUploader from '../../components/AvatarUploader';
import UpdatePasswordModal from '../../components/account/UpdatePasswordModal';

class Profile extends Component {
  static propTypes = {
    updateMyAccountRequest: PropTypes.func.isRequired,
    myAccount: PropTypes.object.isRequired,
  }

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
      toast.info('Successfully saved');
    } else if (data?.errors) {
      this.setState({ errors: data.errors });
    } else {
      toast.error('Something went wrong');
    }
  }

  toggleChangePassword = (changePassword) => {
    this.setState({ changePassword });
  }

  render() {
    const { errors, requestData, changePassword } = this.state;
    const { myAccount } = this.props;
    this.initValues(myAccount);
    return (
      <div className="profileSettings">
        <form onSubmit={this.saveAccount}>
          <div className="left">
            <AvatarUploader
              value={myAccount.avatar}
              onChange={(val) => this.handleChange(val || '', 'avatar')}
            />
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
            <Button className="save" color="accent" type="submit">Save Changes</Button>
          </div>
        </form>
        {changePassword ? (
          <UpdatePasswordModal
            onClose={() => this.toggleChangePassword(false)}
          />
        ) : null}
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
