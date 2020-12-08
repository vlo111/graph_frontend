import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Select from "../form/Select";
import { LABEL_SHARE_TYPES } from "../../data/graph";
import {
  deleteShareGraphWithUsersRequest,
  getSharedWithUsersRequest,
  updateShareGraphWithUsersRequest
} from "../../store/actions/share";

class ShareUserItem extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    updateShareGraphWithUsersRequest: PropTypes.func.isRequired,
  }

  handleUserRoleChange = async (value) => {
    const { user } = this.props;
    if (value.value === 'none') {
      await this.props.deleteShareGraphWithUsersRequest(user.share.id);
    } else {
      await this.props.updateShareGraphWithUsersRequest(user.share.id, { role: value.value });
    }
    this.props.onChange(user, value.value);
  }

  render() {
    const { user } = this.props;
    console.log(user.share.role);
    return (
      <div className="shareUserItem">
        <span className="userName">
          {`${user.firstName} ${user.lastName} `}
          {user.email ? `(${user.email})` : null}
        </span>
        <Select
          portal
          onChange={this.handleUserRoleChange}
          value={LABEL_SHARE_TYPES.filter((t) => t.value === user.share.role)}
          containerClassName="shareType"
          options={LABEL_SHARE_TYPES}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  updateShareGraphWithUsersRequest,
  deleteShareGraphWithUsersRequest,
  getSharedWithUsersRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ShareUserItem);

export default Container;
