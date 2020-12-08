import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import ContextMenu from '../contextMenu/ContextMenu';
import Select from '../form/Select';
import { searchUsers } from '../../store/actions/profile';
import { getSharedWithUsersRequest, shareGraphWithUsersRequest } from '../../store/actions/share';
import ShareUserItem from './ShareUserItem';

class LabelShare extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    shareGraphWithUsersRequest: PropTypes.func.isRequired,
    getSharedWithUsersRequest: PropTypes.func.isRequired,
    searchUsers: PropTypes.func.isRequired,
    shareWithUsers: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  componentDidMount() {
    ContextMenu.event.on('label.share', this.openShareModal);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('label.share', this.openShareModal);
  }

  openShareModal = (params) => {
    const { match: { params: { graphId = '' } } } = this.props;
    this.props.getSharedWithUsersRequest(graphId, 'label', '1.555');
    this.setState({ open: true });
  }

  closeModal = () => {
    this.setState({ open: false });
  }

  searchUser = async (value) => {
    const { payload: { data } } = await this.props.searchUsers(value);
    return data.users || [];
  }

  addUser = async (value) => {
    const { match: { params: { graphId = '' } } } = this.props;
    const labelId = '1.555';
    await this.props.shareGraphWithUsersRequest({
      graphId,
      userId: value.id,
      type: 'label',
      objectId: labelId,
    });
    this.handleUserRoleChange();
  }

  handleUserRoleChange = () => {
    const { match: { params: { graphId = '' } } } = this.props;
    this.props.getSharedWithUsersRequest(graphId, 'label', '1.555');
  }

  render() {
    const { shareWithUsers } = this.props;
    const { open } = this.state;
    return (
      <Modal
        className="ghModal ghModalLabelShare"
        overlayClassName="ghModalOverlay ghModalLabelShareOverlay"
        isOpen={open}
        onRequestClose={this.closeModal}
      >
        <Select
          label="Add User"
          portal
          placeholder="Search..."
          isAsync
          cacheOptions
          value={[]}
          onChange={this.addUser}
          loadOptions={this.searchUser}
          getOptionLabel={(d) => {
            let label = `${d.firstName} ${d.lastName}`;
            if (d.email) {
              label += `(${d.email})`;
            }
            return label;
          }}
          getOptionValue={(d) => d.id}
        />
        {shareWithUsers.map((user) => (
          <ShareUserItem id={user.id} user={user} onChange={this.handleUserRoleChange} />
        ))}
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  shareWithUsers: state.share.shareWithUsers,
});

const mapDispatchToProps = {
  searchUsers,
  getSharedWithUsersRequest,
  shareGraphWithUsersRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelShare);

export default withRouter(Container);
