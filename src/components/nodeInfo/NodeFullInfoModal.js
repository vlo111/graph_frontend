import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Modal from 'react-modal';
import { Link, withRouter } from 'react-router-dom';
import Button from '../form/Button';
import NodeTabs from './NodeTabs';
import bgImage from '../../assets/images/Colorful-Plait-Background.jpg';
import ConnectionDetails from './ConnectionDetails';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import NodeImage from './NodeImage';

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
    if (_.isEmpty(singleGraph)) {
      return null;
    }
    return (
      <Modal
        className="ghModal"
        overlayClassName="ghModalOverlay ghModalNodeFullInfoOverlay"
        isOpen
        onRequestClose={this.closeNodeInfoModal}
      >
        <div className="ghModalContent">
          <Button className="close" color="transparent" icon={<CloseSvg />} onClick={this.closeNodeInfoModal} />
          <div className="left">
            <div className="graphUser">
              <img
                className="avatar circle"
                src={singleGraph.user?.avatar}
                alt={singleGraph.user?.firstName || ''}
              />
              <span className="userName">{[singleGraph.user?.firstName, singleGraph.user?.lastName].join(' ')}</span>
            </div>
            <div className="nodeFullContent">
              <div className="headerBanner ">
                <div className="textWrapper">
                  <h2 title={node.name} className="name">
                    { node.name && (node.name.length > 10)
                      ? `${node.name.substr(0, 10)}`
                      : node.name}
                  </h2>
                  <h3 title={node.type} className="type">
                    { node.type && (node.type.length > 10)
                      ? `${node.type.substr(0, 10)}`
                      : node.type}
                  </h3>
                </div>
                <div className="frame">
                  <NodeImage node={node} />
                </div>
              </div>
              <div className="nodeDescription" dangerouslySetInnerHTML={{ __html: node.description }} />
              <NodeTabs nodeId={node.id} />
            </div>
          </div>
          <div className="right">
            <ConnectionDetails nodeId={node.id} />
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
