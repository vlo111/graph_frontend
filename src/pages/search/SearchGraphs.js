import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter, Link } from 'react-router-dom';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import memoizeOne from 'memoize-one';
import { getGraphsListRequest } from '../../store/actions/graphs';

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
 
  render() {
    const { setLimit, graphsList } = this.props;
    const { page = 1, s: searchParam } = queryString.parse(window.location.search);
    this.getGraphs(page, searchParam);
    return (
      <div className="searchData">
        {graphsList && !isEmpty(graphsList) && graphsList.length ? (
          <div className="searchData__wrapper">
            <h3>{`Graph${graphsList.length > 1 ? 's' : ''}`}</h3>
            {graphsList.slice(0, 5).map((graph) => (
              <article key={graph.id} className="searchData__graph">
                <div className="searchData__graphInfo">
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
                </div>
              </article>
            ))}
            {
              setLimit && graphsList.length > 5
              && <div className="viewAll"><Link to={`search-graph?s=${searchParam}`}>View all</Link></div>
            }
          </div>
        ) : ((!setLimit && <h3>No Graph Found</h3>) || null)}
      </div>
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
