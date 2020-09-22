import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Modal from 'react-modal';
import { withRouter } from 'react-router-dom';
import NodeTabs from './NodeTabs';
import bgImage from '../../assets/images/Colorful-Plait-Background.jpg';
import ConnectionDetails from './ConnectionDetails';

class NodeFullInfo extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
  }

  closeNodeInfoModal = () => {
    const queryObj = queryString.parse(window.location.search);
    delete queryObj.expand;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  render() {
    const { node, singleGraph } = this.props;
    return (
      <Modal
        className="ghModal"
        overlayClassName="ghModalOverlay ghModalNodeFullInfoOverlay"
        isOpen
        onRequestClose={this.closeNodeInfoModal}
      >
        <div className="ghModalContent">
          <div className="left">
            <div className="nodeFullHeader">
              <div className="graphUser">
                <img
                  className="avatar circle"
                  src={singleGraph.user.avatar}
                  alt={singleGraph.user.firstName}
                />
                <span className="userName">{[singleGraph.user.firstName, singleGraph.user.lastName].join(' ')}</span>
              </div>

            </div>
            <div className="nodeFullContent">
              <div className="headerBanner">
                <img
                  src={node.icon ? `${node.icon}.large` : bgImage}
                  onError={(ev) => {
                    if (ev.target.src !== node.icon) {
                      ev.target.src = node.icon;
                    }
                  }}
                  alt="background"
                />
                <div className="textWrapper">
                  <h2 className="name">{node.name}</h2>
                  <h3 className="type">{node.type}</h3>
                </div>
              </div>
              <NodeTabs node={node} />
            </div>
          </div>
          <div className="right">
            <ConnectionDetails nodeName={node.name} />
          </div>
        </div>
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
)(NodeFullInfo);

export default withRouter(Container);
