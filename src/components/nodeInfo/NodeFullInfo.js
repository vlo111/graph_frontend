import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import memoizeOne from 'memoize-one';
import Chart from '../../Chart';
import Outside from '../Outside';
import NodeTabs from './NodeTabs';
import bgImage from '../../assets/images/no-img.png';
import HeaderMini from '../HeaderMini';
import ConnectionDetails from './ConnectionDetails';
import ChartUtils from '../../helpers/ChartUtils';
<<<<<<< HEAD
import { getNodeCustomFieldsRequest } from '../../store/actions/graphs';
import Loading from '../Loading';
=======
import NodeImage from "./NodeImage";
>>>>>>> origin/master

class NodeFullInfo extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    editable: PropTypes.bool,
    getNodeCustomFieldsRequest: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.state = {
      loading: false,
    };

  }

  static defaultProps = {
    editable: true,
  }

  getCustomFields = memoizeOne(async (graphId, nodeId) => {
    this.setState({ loading: false });
    if(!graphId || !nodeId) return;
    this.setState({ loading: true });
    await this.props.getNodeCustomFieldsRequest(graphId, nodeId);
    this.setState({ loading: false });

    if (document.getElementsByClassName('ghModalFilters')[0]) {
      const tabElement = document.getElementById('nodeFullInfo');
      tabElement.style.marginRight = '300px';
      tabElement.style.width = '30%';
    }
  });

  closeNodeInfo = () => {
    const queryObj = queryString.parse(window.location.search);
    delete queryObj.info;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  render() {
    const {
      editable, singleGraph: {
        id, nodesPartial, linksPartial, labels,
      },
    } = this.props;

    const { loading } = this.state;

    const queryObj = queryString.parse(window.location.search);
    const { info: nodeId, expand } = queryObj;

    this.getCustomFields(id, nodeId);

    if (!nodeId) {
      return null;
    }
    const node = Chart.getNodes().find((n) => n.id === nodeId);

    if (node) {
      ChartUtils.findNodeInDom(node);
    }
    if (!node) {
      return null;
    }

    return (
      <Outside onClick={this.closeNodeInfo} exclude=".ghModalOverlay,.contextmenuOverlay,.jodit">
        <div id="nodeFullInfo">
          <HeaderMini
            headerImg={node.icon ? node.icon : bgImage}
            node={node}
<<<<<<< HEAD
            editable={editable}
            expand={expand}
            queryObj={queryObj}
          />
          <div className="nodeFullContent">
            <NodeTabs nodeId={node.id} editable={editable} />
            <ConnectionDetails labels={labels} nodes={nodesPartial} links={linksPartial} nodeId={node.id} />
=======
            tabs={customFields}
            editable={editable}
          />
          <div className="nodeFullContent">
            <div className="headerBanner">
              <NodeImage node={node} />

              <div className="textWrapper">
                <h2 className="name">{node.name}</h2>
                <h3 className="type">{node.type}</h3>
              </div>
              <Link replace className="expand" to={`?${queryString.stringify({ ...queryObj, expand: '1' })}`}>
                Expand
              </Link>
            </div>
            <NodeTabs node={node} editable={editable} />
>>>>>>> origin/master
          </div>
        </div>

        {loading ? (
          <div className="loadingWrapper">
            <Loading />
          </div>
        ) : null}
      </Outside>
    );
  }
}

<<<<<<< HEAD
const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  getNodeCustomFieldsRequest,
};
=======
const
  mapStateToProps = (state) => ({
    singleGraph: state.graphs.singleGraph, // rerender then data changed
    customFields: state.graphs.singleGraph.customFields || {},
  });

const
  mapDispatchToProps = {};
>>>>>>> origin/master

const
  Container = connect(
    mapStateToProps,
    mapDispatchToProps,
  )(NodeFullInfo);

export default withRouter(Container);
