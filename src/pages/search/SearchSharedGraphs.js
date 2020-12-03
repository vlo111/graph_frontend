import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment';
import memoizeOne from 'memoize-one';
import { searchGraphsListRequest } from '../../store/actions/shareGraphs';

class SearchSharedGraphs extends Component {
  static propTypes = {
    setLimit: PropTypes.bool,
    searchGraphsListRequest: PropTypes.func.isRequired,
    shareGraphsList: PropTypes.array.isRequired,
  };

  static defaultProps = {
    setLimit: false,
  }

  getGraphs = memoizeOne((page, searchParam) => {
    this.props.searchGraphsListRequest(page, { s: searchParam });
  })

  render() {
    const { setLimit, shareGraphsList } = this.props;
    const { page = 1, s: searchParam } = queryString.parse(window.location.search);
    this.getGraphs(page, searchParam);
    return (
      <div className="searchData">
        {shareGraphsList && shareGraphsList.length ? (
          <div className="searchData__wrapper">
            <h3>{`Graph${shareGraphsList.length > 1 ? 's' : ''} shared with you`}</h3>
            {shareGraphsList.slice(0, 5).map((shGraph) => (
              <article key={shGraph.graph.id} className="searchData__graph">
                <div className="searchData__graphInfo">
                  <img
                    className="avatar"
                    src={shGraph.graph.user.avatar}
                    alt={shGraph.graph.user.name}
                  />
                  <div className="searchData__graphInfo-details">
                    <Link to={`/graphs/preview/${shGraph.graph.id}`}>
                      {shGraph.graph.title}
                      {searchParam && shGraph.graph.status !== 'active'
                        ? (
                          <span>{` (${shGraph.graph.status})`}</span>
                        ) : null}
                    </Link>
                    <span className="description">
                      {shGraph.graph.description.length > 300
                        ? `${shGraph.graph.description.substr(0, 300)}... `
                        : shGraph.graph.description}
                    </span>
                  </div>
                  <div>
                    <span className="author">{`${shGraph.graph.user.firstName} ${shGraph.graph.user.lastName}`}</span>
                    <div className="info">
                      <span>{moment(shGraph.graph.updatedAt).calendar()}</span>
                      <span>{`  (${shGraph.graph.nodesCount} nodes) `}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {
              setLimit && shareGraphsList.length > 5
              && <div className="viewAll"><Link to={`search-graph?s=${searchParam}`}>View all</Link></div>
            }
          </div>
        ) : ((!setLimit && <h3>No Shared Graphs Found</h3>) || null)}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  shareGraphsList: state.graphs.shareGraphsList,
});
const mapDispatchToProps = {
  searchGraphsListRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchSharedGraphs);

export default withRouter(Container);
