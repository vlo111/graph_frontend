import React, { Component } from 'react';
import Modal from 'react-modal';
import queryString from 'query-string';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Chart from '../Chart';

class GraphUsersInfo extends Component {
  static propTypes = {
    singleGraph: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  render() {
    const { singleGraph } = this.props;
    const { info: nodeName } = queryString.parse(window.location.search);

    if (!nodeName || !singleGraph.users) return null;

    const node = Chart.getNodes().find((d) => d.name === nodeName);
    if (!node) return null;

    const createdUser = singleGraph.users.find((u) => u.id === (node.createdUser || singleGraph.userId)) || {};
    const updatedUser = singleGraph.users.find((u) => u.id === (node.updatedUser || singleGraph.userId)) || {};
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
              <span className="userName">
                {`${updatedUser.firstName} ${updatedUser.lastName}`}
              </span>
              <span className="time">
                {node.createdAt ? moment(node.createdAt * 1000).calendar() : ''}
              </span>
            </div>
          </div>
        </div>
        {node.createdAt !== node.updatedAt ? (
          <div className="info updated">
            <h3>Updated</h3>
            <div>
              <img src={updatedUser.avatar} className="avatar" alt="" />
              <div className="right">
                <span className="userName">
                  {`${updatedUser.firstName} ${updatedUser.lastName}`}
                </span>
                <span className="time">
                  {node.updatedAt ? moment(node.updatedAt * 1000).calendar() : ''}
                </span>
              </div>

            </div>
          </div>
        ) : null}
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphUsersInfo);

export default Container;
