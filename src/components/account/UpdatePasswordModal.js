import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import _ from 'lodash';
import Button from '../form/Button';
import { updateMyAccountPasswordRequest } from '../../store/actions/account';
import PasswordInput from '../form/PasswordInput';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';


class UpdatePasswordModal extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    updateMyAccountPasswordRequest: PropTypes.func.isRequired,
    className: PropTypes.string,
  }

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
    const { className } = this.props;
    return (
      <Modal
        className="ghModal changePasswordModal"
        overlayClassName={classNames('ghModalOverlay changePasswordModalOverlay',className)}
        isOpen
        onRequestClose={this.props.onClose}
      >
        <form onSubmit={this.handlePasswordChange}>
          <h3>Change Password</h3>
          <PasswordInput
            name="oldPassword"
            label="Old Password"
            type="password"
            value={requestData.oldPassword}
            error={errors.oldPassword}
            onChangeText={this.handleChange}
          />
          <PasswordInput
            name="password"
            label="New Password"
            type="password"
            containerClassName="newPassword"
            value={requestData.password}
            error={errors.password}
            onChangeText={this.handleChange}
          />
          <PasswordInput
            name="confirmPassword"
            label="Confirm Password"
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
              icon={<CloseSvg />}
            >
              
            </Button>
            <Button color="accent" type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  updateMyAccountPasswordRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UpdatePasswordModal);

export default Container;
