import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import _ from 'lodash';
import { connect } from 'react-redux';
import queryString from 'query-string';
import SearchInput from './search/SearchInput';
import AccountDropDown from './account/AccountDropDown';
import Utils from '../helpers/Utils';
import PropTypes from 'prop-types';

import Chart from '../Chart';
import { setLoading } from '../store/actions/app';
import ExportNodeTabs from './ExportNode/ExportNodeTabs';
import GraphUsersInfo from "./GraphUsersInfo";
import Button from "./form/Button";
import CommentModal from './CommentNode';
import { getActionsCountRequest } from '../store/actions/commentNodes';

class HeaderMini extends Component {
  static propTypes = {
    getActionsCount: PropTypes.func.isRequired,
    commentCount: PropTypes.func.isRequired,
  }

   commentCountData(){
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
    this.commentCountData()


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
  toggleNodeComment = (showNodeComment) => {
    this.commentCountData();  
    this.setState({ showNodeComment });
  }

  render() {
    const { showGraphUsersInfo, showNodeComment } = this.state;
    const { singleGraph, commentsCount, tabs, node, match: { params: { graphId = '', token = '' } } } = this.props;
    const isInEmbed = Utils.isInEmbed(); 
    return (
      <header id="headerMini">
        <SearchInput />
        <ul className="navLinks">
          <li>
            <Button onClick={() => this.toggleGraphUsersInfo(true)}>
              Info
            </Button>
          </li>
          <li>
            <Button className="commentsInfo"
             // icon={<CommentsSvg style={{ height: 40 }} />}
              title="Comment"
              onClick={() => this.toggleNodeComment(true)}>
                Comment
              {<span>({  commentsCount?.commentsCount  })</span> }              
            </Button>
          </li>
          <li>
            <ExportNodeTabs
              node={node}
              tabs={tabs}
              nodeData={this.state.nodeData}
              image={this.state.image}
            />
          </li>
        </ul>
        {
          !isInEmbed ? (
            <AccountDropDown mini />
          ) : null
        }

        {showGraphUsersInfo ? (
          <GraphUsersInfo onClose={() => this.toggleGraphUsersInfo(false)} />
        ) : null}
        {showNodeComment ? (
          <CommentModal
            closeModal={() => this.toggleNodeComment(false)}
            graph={singleGraph}

          />
        ) : null}

      </header>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
  commentsCount: state.commentNodes.commentCount
});

const mapDispatchToProps = {
  setLoading,
  getActionsCountRequest
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HeaderMini);

export default withRouter(Container);
