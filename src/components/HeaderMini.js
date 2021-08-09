import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import queryString from 'query-string';
import memoizeOne from 'memoize-one';
import Utils from '../helpers/Utils';
import Chart from '../Chart';
import { setLoading, toggleNodeModal } from '../store/actions/app';
import ExportNodeTabs from './ExportNode/ExportNodeTabs';
import GraphUsersInfo from './graphData/GraphUsersInfo';
import Button from './form/Button';
import CommentModal from './CommentNode';
import ContextMenu from './contextMenu/ContextMenu';
import CustomFields from '../helpers/CustomFields';
import { getActionsCountRequest } from '../store/actions/commentNodes';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';
import { ReactComponent as InfoSvg } from '../assets/images/icons/info.svg';
import { ReactComponent as CommentSvg } from '../assets/images/icons/comment.svg';
import { ReactComponent as ExpandSvg } from '../assets/images/icons/expand.svg';
import { ReactComponent as EditSvg } from '../assets/images/icons/edit.svg';
import NodeImage from './nodeInfo/NodeImage';
import NodeFullInfoModal from './nodeInfo/NodeFullInfoModal';
import { getNodeHistoryRequest } from '../store/actions/graphsHistory';

class HeaderMini extends Component {
  static propTypes = {
    getActionsCount: PropTypes.func.isRequired,
    commentCount: PropTypes.func.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
    getNodeHistoryRequest: PropTypes.func.isRequired,
  }

  componentDidMount() {
    ContextMenu.event.on('node.edit', this.editNode);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('node.edit', this.editNode);
  }

  editNode = (ev) => {
    const { node, tabs } = this.props;
    if (node.readOnly) {
      return;
    }
    const customField = CustomFields.get(tabs, 'node.edit', node.id);
    this.props.toggleNodeModal({ ...node, customField });
  }

  commentCountData() {
    const { match: { params: { graphId } } } = this.props;

    const { info: nodeId } = queryString.parse(window.location.search);
    if (!nodeId) {
      return null;
    }
    const nodeDatas = Chart.getNodes().find((n) => n.id === nodeId);
    if (!nodeDatas) {
      return null;
    }
    this.props.getActionsCountRequest(graphId, nodeId);
  }

  async componentWillMount() {
    this.commentCountData();

    let {
      headerImg, node,
    } = this.props;

    const nodeData = [];

    const nodeLinks = Chart.getNodeLinks(node.id, 'all');
    const nodes = Chart.getNodes();
    const connectedNodes = nodeLinks.map(async (l) => {
      let connected;
      if (l.id === node.id) {
        connected = nodes.find((d) => d.id === l.target);
      } else {
        connected = nodes.find((d) => d.id === l.source);
      }
      connected.icon = await Utils.blobToBase64(connected.icon);

      nodeData.push({ name: connected.name, icon: connected.icon });

      this.setState({ nodeData });

      return {
        linkType: l.type,
        connected,
      };
    });

    const connectedNodesGroup = Object.values(_.groupBy(connectedNodes, 'linkType'));
    const obj = _.orderBy(connectedNodesGroup, (d) => d.length, 'desc');

    this.setState({ nodeData: obj });

    if (headerImg && !headerImg.startsWith('https://maps.googleapis.com')) {
      headerImg = await Utils.blobToBase64(headerImg);
    }
    this.setState({ image: headerImg });
  }

  toggleGraphUsersInfo = (showGraphUsersInfo) => {
    this.setState({ showGraphUsersInfo });
  }

  closeComment = (showNodeComment) => {
    this.commentCountData();
    this.setState({ showNodeComment });
  }

  toggleNodeComment = (showNodeComment) => {
    const tableElement = document.getElementById('nodeFullInfo');
    const closeTabElement = document.getElementsByClassName('close')[0];
    const commentModalElement = document.getElementsByClassName('tabComment')[0];

    if (showNodeComment) {
      tableElement.style.width = '500px';
      closeTabElement.style.display = 'none';

      this.closeComment(showNodeComment);
    } else {
      closeTabElement.style.display = 'flex';
      commentModalElement.style.transition = 'all 0.5s ease-in-out 0s';
      commentModalElement.style.transformOrigin = 'right top';
      commentModalElement.style.transform = 'scaleX(0)';

      setTimeout(() => {
        tableElement.style.width = '45%';
      }, 400);

      setTimeout(() => {
        this.closeComment(showNodeComment);
      }, 700);
    }
  }

  closeNodeInfoModal = () => {
    const queryObj = queryString.parse(window.location.search);
    delete queryObj.info;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  initHistory = memoizeOne(() => {
    const { match: { params: { graphId } }, node } = this.props;
    this.props.getNodeHistoryRequest(graphId, node.id);
  });

  render() {
    const { showGraphUsersInfo, showNodeComment } = this.state;
    const {
      editable, singleGraph, commentsCount, tabs, node, match: { params: { graphId = '', token = '' } }, expand, queryObj,
    } = this.props;

    this.initHistory();

    // const nodeHistory = getSingleNodeHistory;
    // const nodePositionCount = getSingleNodePositionCount;
    // const nodeTabsViewCount = getSingleNodeTabsViewCount;

    // const { firstName, lastName } = singleGraph.users.find((u) => +u.id === +(node.createdUser));
    return (
      <header id="headerMini">
        <div className="header">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={() => this.closeNodeInfoModal()} />
          <div className="nav-bar-header">
            <Button
              icon={<ExpandSvg />}
              title="expand"
              onClick={() => { this.props.history.replace(`?${queryString.stringify({ ...queryObj, expand: '1' })}`); }}
            >
              Expand
            </Button>
            <ExportNodeTabs
              node={node}
              tabs={tabs}
              nodeData={this.state.nodeData}
              image={this.state.image}
            />
            {editable ? (
              <Button
                icon={<EditSvg />}
                title="edit"
                onClick={(ev) => this.editNode(ev)}
              >
                Edit
              </Button>
            ) : null}
          </div>
        </div>
        <div className="headerBanner ">
          <div className="frame">
            <NodeImage node={node} />
            <div className="bottom-icons">
              <Button
                icon={<InfoSvg />}
                title="Info"
                onClick={() => this.toggleGraphUsersInfo(true)}
              >
                History
              </Button>
              <Button
                icon={<CommentSvg />}
                title="Comment"
                onClick={() => this.toggleNodeComment(true)}
              >
                Comment
              </Button>
            </div>
          </div>
          <div className="textWrapper">
            <h2 title={node.name} className="name">
              {node.name && node.name.length > 10
                ? `${node.name.substr(0, 10)}`
                : node.name}
            </h2>
            <h3 title={node.type} className="type">
              {node.type && node.type.length > 10
                ? `${node.type.substr(0, 10)}`
                : node.type}
            </h3>
          </div>
          {/* <div className="info-data"> */}
          {/*  <div className="text-block"> */}
          {/*    <p>Total change acctions:</p> */}
          {/*    <p>Change position count:</p> */}
          {/*    <p>Tabs view count:</p> */}
          {/*    <p>Created by:</p> */}
          {/*  </div> */}
          {/*  <div className="data-block"> */}
          {/*    /!*<p>{nodeHistory.length}</p>*!/ */}
          {/*    <p>0</p> */}
          {/*    /!* <p>{ nodePositionCount }</p> *!/ */}
          {/*    /!* <p>{ nodeTabsViewCount }</p> *!/ */}
          {/*    <p>0</p> */}
          {/*    <p>0</p> */}
          {/*    <p> */}
          {/*      {firstName} */}
          {/*      {' '} */}
          {/*      {lastName} */}
          {/*    </p> */}
          {/*  </div> */}
          {/* </div> */}
        </div>

        <div className="footer-link">
          <a title={node.link} target="_blank" href={node.link} rel="noreferrer">
            {node.link && node.link.length > 45
              ? `${node.link.substr(0, 45)}...`
              : node.link}
          </a>
        </div>

        {showGraphUsersInfo ? (
          <GraphUsersInfo
            closeModal={() => this.toggleGraphUsersInfo(false)}
            graph={singleGraph}
          />
        ) : null}
        {showNodeComment ? (
          <CommentModal
            closeModal={() => this.toggleNodeComment(false)}
            graph={singleGraph}
          />
        ) : null}

        {expand === '1' ? (
          <NodeFullInfoModal node={node} />
        ) : null}

      </header>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
  commentsCount: state.commentNodes.commentCount,
});

const mapDispatchToProps = {
  setLoading,
  getActionsCountRequest,
  toggleNodeModal,
  getNodeHistoryRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HeaderMini);

export default withRouter(Container);
