import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import Input from '../form/Input';
import Button from '../form/Button';
import { toast } from "react-toastify";
import { updateMyAccountPasswordRequest } from "../../store/actions/account";
import _ from "lodash";

class UpdatePasswordModal extends Component {
  static propTypes = {}

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        oldPassword: '',
        password: '',
        confirmPassword: '',
      },
      errors: {},
    };
  }

  handleChange = (value, path) => {
    const { requestData } = this.state;
    _.set(requestData, path, value);
    this.setState({ requestData, errors: {} });
  }

  handlePasswordChange = async (ev) => {
    ev.preventDefault();
    const { requestData } = this.state;

    const { payload: { data } } = await this.props.updateMyAccountPasswordRequest(requestData);
    if (data.status === 'ok') {
      toast.info('Password successfully updated');
      this.props.onClose();
    } else if (data?.errors) {
      this.setState({ errors: data.errors });
    } else {
      toast.error('Something went wrong');
    }
  }


  render() {
    const { requestData, errors } = this.state;
    return (
      <Modal
        className="ghModal changePasswordModal"
        overlayClassName="ghModalOverlay changePasswordModalOverlay"
        isOpen
        onRequestClose={this.props.onClose}
      >
        <form onSubmit={this.handlePasswordChange}>
          <h3>Change Password</h3>
          <Input
            name="oldPassword"
            label="Old Password"
            type="password"
            value={requestData.oldPassword}
            error={errors.oldPassword}
            onChangeText={this.handleChange}
          />
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
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={requestData.confirmPassword}
            error={errors.confirmPassword}
            onChangeText={this.handleChange}
          />
          <div className="buttonsWrapper">
            <Button
              color="transparent"
              className="cancel"
              onClick={this.props.onClose}
            >
              Cancel
            </Button>
            <Button color="accent" type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  updateMyAccountPasswordRequest
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UpdatePasswordModal);

export default Container;
