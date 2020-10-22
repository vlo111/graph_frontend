import React, { Component } from 'react';
import Modal from 'react-modal';
import queryString from 'query-string';
import moment from 'moment';
import { connect } from 'react-redux';
import Chart from '../Chart';
import { setActiveButton } from '../store/actions/app';
import { getSingleGraphRequest } from '../store/actions/graphs';

class GraphUsersInfo extends Component {
  render() {
    const { singleGraphUsers, myAccount } = this.props;
    const { info: nodeName } = queryString.parse(window.location.search);
    if (!nodeName) {
      return null;
    }
    const node = Chart.getNodes().find((d) => d.name === nodeName);
    const createdUser = singleGraphUsers.find((u) => u.id === (node.createdUser || myAccount.id)) || {};
    const updatedUser = singleGraphUsers.find((u) => u.id === node.updatedUser) || {};
    console.log(updatedUser);
    return (
      <Modal
        isOpen
        className="ghModal graphUsersInfo"
        overlayClassName="ghModalOverlay graphUsersInfoOverlay"
        onRequestClose={this.props.onClose}
      >
        <h2>{node.name}</h2>
        <div className="info crated">
          <h3>Created</h3>
          <div>
            <img src={createdUser.avatar} className="avatar" alt="" />
            <div className="right">
              <span className="userName">{`${createdUser.firstName} ${createdUser.lastName}`}</span>
              <span className="time">
                {node.createdAt ? moment(node.createdAt * 1000).calendar() : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="info updated">
          <h3>Updated</h3>
          <div>
            <img src={updatedUser.avatar} className="avatar" alt="" />
            <div className="right">
              <span className="userName">{`${updatedUser.firstName} ${updatedUser.lastName}`}</span>
              <span className="time">
                {node.updatedAt ? moment(node.updatedAt * 1000).calendar() : ''}
              </span>
            </div>

          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraphUsers: state.graphs.singleGraph.users || [],
  myAccount: state.account.myAccount,
});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphUsersInfo);

export default Container;
