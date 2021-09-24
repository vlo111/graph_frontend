import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter, Link } from 'react-router-dom';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import memoizeOne from 'memoize-one';
import { getGraphsListRequest } from '../../store/actions/graphs';
import Tooltip from 'rc-tooltip';
import GraphListFooter from '../../components/graphData/GraphListFooter';
import GraphDashboardSubMnus from '../../components/graphData/GraphListHeader';
import NotFound from '../../assets/images/NotFound.png';

class SearchGraphs extends Component {
  static propTypes = {
    setLimit: PropTypes.bool,
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
  };

  static defaultProps = {
    setLimit: false,
  }


  getGraphs = memoizeOne((page, searchParam) => {
    this.props.getGraphsListRequest(page, { s: searchParam });
  })
  showCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'flex';
  }

  hideCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'none';
  }

  updateGraph = (graph) => {
    const { graphsList } = this.props;

    graphsList.map((p) => {
      if (p.id === graph.id) {
        p.title = graph.title;
        p.description = graph.description;
      }
    });

    this.setState({
      graphsList,
    });
  }

  render() {
    const { setLimit, graphsList, headerTools } = this.props;
    const { page = 1, s: searchParam } = queryString.parse(window.location.search);
    this.getGraphs(page, searchParam);
    return (
      <>
        {graphsList && !isEmpty(graphsList) && graphsList.length ? (
          <>
            {/* <h3>{`Graph${graphsList.length > 1 ? 's' : ''}`}</h3> */}
            {graphsList.map((graph) => (
              <article key={graph.id} className="graphs">
                {/* <div className="searchData__graphInfo">
                  <img
                    className="avatar"
                    src={graph.user.avatar}
                    alt={graph.user.name}
                  />
                  <div className="searchData__graphInfo-details">
                    <Link to={`/graphs/preview/${graph.id}`}>
                      {graph.title}
                      {searchParam && graph.status !== 'active'
                        ? (
                          <span>{` (${graph.status})`}</span>
                        ) : null}
                    </Link>
                    <span className="description">
                      {graph.description.length > 300 ? `${graph.description.substr(0, 300)}... ` : graph.description}
                    </span>
                  </div>
                  <div>
                    <span className="author">{`${graph.user.firstName} ${graph.user.lastName}`}</span>
                    <div className="info">
                      <span>{moment(graph.updatedAt).calendar()}</span>
                      <span>{` (${graph.nodesCount} nodes )`}</span>
                    </div>
                  </div>
                </div> */}
                <div className="top">
                  <div className="infoContent">
                    <img
                      className="avatar"
                      src={graph.user.avatar}
                      alt={graph.user.name}
                    />
                    <div className="infoWrapper">
                      <Link to={`/profile/${graph.user.id}`}>
                        <span className="author">{`${graph.user.firstName} ${graph.user.lastName}`}</span>
                      </Link>
                      <div className="info">
                        <span>{moment(graph.updatedAt).calendar()}</span>
                        <span className="nodesCount">{` ${graph.nodesCount} nodes `}</span>
                      </div>
                    </div>
                  </div>
                  <div className="sub-menus">
                    <GraphDashboardSubMnus updateGraph={this.updateGraph} graph={graph} />
                  </div>
                </div>
                <div>
                  <Tooltip overlay={graph.title} placement="bottom" >
                    <h3>
                      {' '}
                      {graph.title.length > 25 ? `${graph.title.substring(0, 25)}...` : graph.title}
                    </h3>
                  </Tooltip>
                  <div className="descriptionGraph">
                    <Tooltip overlay={graph.description} placement="bottom" >
                      <span>
                        {' '}
                        {graph.description.length > 40 ? `${graph.description.substring(0, 40)}...` : graph.description}
                      </span>
                    </Tooltip>
                  </div>
                </div>

                <div
                  onMouseOver={() => this.showCardOver(graph.id)}
                  onMouseOut={() => this.hideCardOver(graph.id)}
                  className="graph-image"
                >

                  <div className={`buttonView graph-card_${graph.id}`}>
                    <Link className="btn-edit view" to={`/graphs/update/${graph.id}`} replace> Edit </Link>
                    <Link className="btn-preview view" to={`/graphs/view/${graph.id}`} replace> Preview</Link>
                  </div>
                  <img
                    className="thumbnail"
                    src={`${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`}
                    alt={graph.title}
                  />
                </div>
                <GraphListFooter graph={graph} />
              </article>
            ))}
            {/* {
              setLimit && graphsList.length > 5
              && <div className="viewAll"><Link to={`search-graph?s=${searchParam}`}>View all</Link></div>
            } */}
          </>
        ) : ((!setLimit && <div className='not_found'>
          <img src={NotFound} />
          <h3>Not Found</h3>
        </div>) || null)}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  graphsList: state.graphs.graphsList,
});
const mapDispatchToProps = {
  getGraphsListRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchGraphs);

export default withRouter(Container);
