import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import queryString from 'query-string';
import Utils from '../helpers/Utils';
import Chart from '../Chart';
import ExportNodeTabs from './ExportNode/ExportNodeTabs';
import GraphUsersInfo from './History/GraphUsersInfo';
import Button from './form/Button';
import CommentModal from './CommentNode';
import ContextMenu from './contextMenu/ContextMenu';
import CustomFields from '../helpers/CustomFields';
import NodeImage from './nodeInfo/NodeImage';
import NodeFullInfoModal from './nodeInfo/NodeFullInfoModal';
import { getActionsCountRequest } from '../store/actions/commentNodes';
import { setLoading, toggleNodeModal } from '../store/actions/app';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';
import { ReactComponent as InfoSvg } from '../assets/images/icons/info.svg';
import { ReactComponent as CommentSvg } from '../assets/images/icons/comment.svg';
import { ReactComponent as ExpandSvg } from '../assets/images/icons/expand.svg';
import { ReactComponent as EditSvg } from '../assets/images/icons/edit.svg';

class HeaderMini extends Component {
  static propTypes = {
    getActionsCount: PropTypes.func.isRequired,
    commentCount: PropTypes.func.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
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

  getSettingsElements = (name) => ({
    tableElement: document.getElementById('nodeFullInfo'),
    closeTabElement: document.getElementsByClassName('close')[0],
    name: document.getElementsByClassName('name')[0],
    item: document.getElementsByClassName(name)[0],
  })

  updateTab = (show, className) => {
    const { tableElement, closeTabElement, item, name } = this.getSettingsElements(className);

    if (show) {
      tableElement.style.width = '500px';
      closeTabElement.style.display = 'none';
      setTimeout(() => {
        name.classList.add("name-overflow");
      }, 400);
    } else {
      closeTabElement.style.display = 'flex';
      item.style.transition = 'all 0.5s ease-in-out 0s';
      item.style.transformOrigin = 'right top';
      item.style.transform = 'scaleX(0)';

      setTimeout(() => {
        tableElement.style.width = '45%';
        name.classList.remove("name-overflow");
      }, 400);
    }
  }

  toggleGraphUsersInfo = (showGraphUsersInfo) => {
    this.updateTab(showGraphUsersInfo, 'graphUsersInfo');

    if (showGraphUsersInfo) {
      setTimeout(() => {
        this.setState({ showGraphUsersInfo });
      }, 600);
    } else {
      setTimeout(() => {
        this.setState({ showGraphUsersInfo });
      }, 700);
    }
  }

  closeComment = (showNodeComment) => {
    this.commentCountData();
    this.setState({ showNodeComment });
  }

  toggleNodeComment = (showNodeComment) => {
    this.updateTab(showNodeComment, 'tabComment');

    if (showNodeComment) {
      setTimeout(() => {
        this.closeComment(showNodeComment);
      }, 600);
    } else {
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

  render() {
    const { showGraphUsersInfo, showNodeComment } = this.state;
    const {
      editable, singleGraph, commentsCount, tabs, node, match: { params: { graphId = '', token = '' } }, expand, queryObj,
    } = this.props;
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
                {`Comment ${commentsCount}` }
              </Button>
            </div>
          </div>
          <div className="textWrapper">
            <h2 className="name">
              {node.name}
            </h2>
            <h3 className="type">
              {node.type}
            </h3>
            <div className="node-keywords">
              {node.keywords.map((p) => (
                  <span>{`${p}  `}</span>
              ))}
            </div>
          </div>

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
  commentsCount: state.commentNodes.commentCount.commentsCount,
});

const mapDispatchToProps = {
  setLoading,
  getActionsCountRequest,
  toggleNodeModal,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HeaderMini);

export default withRouter(Container);
