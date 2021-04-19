import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link, Prompt } from 'react-router-dom';
import Tooltip from 'rc-tooltip';
import { toast } from 'react-toastify';
import memoizeOne from 'memoize-one';
import Wrapper from '../components/Wrapper';
import ReactChart from '../components/chart/ReactChart';
import { setActiveButton } from '../store/actions/app';
import Button from '../components/form/Button';
import { ReactComponent as EditSvg } from '../assets/images/icons/edit.svg';
import { ReactComponent as UndoSvg } from '../assets/images/icons/undo.svg';
import Filters from '../components/filters/Filters';
import NodeDescription from '../components/NodeDescription';
import { deleteGraphRequest, getGraphInfoRequest, getSingleGraphRequest } from '../store/actions/graphs';
import NodeFullInfo from '../components/nodeInfo/NodeFullInfo';
import { userGraphRequest } from '../store/actions/shareGraphs';
import LabelTooltip from '../components/LabelTooltip';
import ToolBarHeader from '../components/ToolBarHeader';
import AnalysisUtils from '../helpers/AnalysisUtils';
import Chart from '../Chart';
import AnalyticalTab from '../components/Analysis/AnalyticalTab';
import ChartUtils from '../helpers/ChartUtils';

class GraphView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    deleteGraphRequest: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    userGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    graphInfo: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  preventReload = true;

  getSingleRequest = memoizeOne(() => {
    const { match: { params: { graphId } } } = this.props;
    this.props.setActiveButton('view');
    this.props.userGraphRequest();
    if (+graphId) {
      this.props.getSingleGraphRequest(graphId);
      this.props.getGraphInfoRequest(graphId);
    }
  })

  deleteGraph = async () => {
    const { match: { params: { graphId = '' } } } = this.props;
    if (window.confirm('Are you sure?')) {
      await this.props.deleteGraphRequest(graphId);
      this.props.history.push('/');
      toast.info('Successfully deleted');
    }
  }

  shareGraph = async () => {
    if (window.confirm('Are you sure?')) {
      this.setState({ openShareModal: true });
    }
  }
  
  handleRouteChange = () => {
    Chart.nodesPath = false;
    Chart.clearLinkShortestPath();
  }

  render() {
    const {
      singleGraph, singleGraphStatus, graphInfo,
      location: { pathname, search }, match: { params: { graphId = '' } },
    } = this.props;
    const preview = pathname.startsWith('/graphs/preview/');

    let shortestNodes = [];
    // let shortestLinks = [];

    // view the shortest path to the analysis field
    if (search.includes('nodeStart=')) {
      const { nodes, links } = singleGraph;

      if (nodes?.length && links?.length) {
        const start = search.substring(search.indexOf('nodeStart=') + 10, search.indexOf('nodeEnd='));
        const end = search.substring(search.indexOf('nodeEnd=') + 8, search.length);

        const { listNodes, listLinks } = AnalysisUtils.getShortestPath(start, end, nodes, links);

        const originalListPath = links.filter((p) => {
          let listChack = false;
          listLinks.forEach((l) => {
            if ((l.source === p.source || l.target === p.source)
                && (l.source === p.target || l.target === p.target)) {
              listChack = true;
            }
          });
          return listChack;
        });

        // shortestLinks = originalListPath;
        listNodes.map((p) => shortestNodes.push(nodes.filter((n) => n.id === p)[0]));

        shortestNodes = shortestNodes.reverse();

        Chart.showPath(originalListPath, listNodes);

        // ChartUtils.findNodeInDom(shortestNodes[0]);
      }
    }
    this.getSingleRequest(pathname);
    return (
      <Wrapper className="graphView" showFooter={false}>
        <div className="graphWrapper">
          <ReactChart />
        </div>
        <Prompt
          when={this.preventReload}
          message={this.handleRouteChange}
        />
        {search.includes('nodeStart=')
          ? <AnalyticalTab nodes={shortestNodes} />
          : (
            <div>
              {preview && singleGraphStatus === 'success' ? (
                <div className="graphPreview">
                  <h1 className="title">{singleGraph.title}</h1>
                  <p className="description">
                    {singleGraph.description}
                  </p>
                  <div>
                    <strong>{'Nodes: '}</strong>
                    {graphInfo.totalNodes}
                  </div>
                  <div>
                    <strong>{'Links: '}</strong>
                    {graphInfo.totalLinks}
                  </div>
                  <div>
                    <strong>{'Views: '}</strong>
                    {singleGraph.views}
                  </div>
                  <Link className="ghButton view" to={`/graphs/view/${graphId}`} replace>
                    View Graph
                  </Link>
                </div>
              ) : (
                <>

                  {['admin', 'edit', 'edit_inside'].includes(singleGraph.currentUserRole) && (
                    <Link to={`/graphs/update/${graphId}`}>
                      <Tooltip overlay="Update">
                        <Button icon={<EditSvg style={{ height: 30 }} />} className="transparent edit" />
                      </Tooltip>
                    </Link>
                  )}
                  <NodeDescription />
                  <Link to="/">
                    <Tooltip overlay="Back">
                      <Button icon={<UndoSvg style={{ height: 30 }} />} className="transparent back" />
                    </Tooltip>
                  </Link>
                </>
              )}
              <ToolBarHeader />
              <NodeFullInfo editable={false} />
              <LabelTooltip />
              <Filters />
            </div>
          )}
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraph: state.graphs.singleGraph,
  userGraphs: state.shareGraphs.userGraphs,
  graphInfo: state.graphs.graphInfo,
  singleGraphStatus: state.graphs.singleGraphStatus,
});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
  deleteGraphRequest,
  userGraphRequest,
  getGraphInfoRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphView);

export default Container;
