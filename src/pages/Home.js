import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { withRouter, Link } from 'react-router-dom';
import { getGraphsListRequest } from '../store/actions/graphs';
import Pagination from '../components/Pagination';
import GraphListFooter from '../components/GraphListFooter';
import GraphListHeader from '../components/GraphListHeader';
import NoGraph from '../components/NoGraph';
import GraphListItem from "../components/GraphListItem";

class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    graphsListInfo: PropTypes.object.isRequired,
    graphsListStatus: PropTypes.string.isRequired,
  }

  getGraphsList = memoizeOne((page, s) => {
    this.props.getGraphsListRequest(page, { s });
  })

  render() {
    const { graphsList, graphsListStatus, graphsListInfo: { totalPages } } = this.props;
    const { page = 1, s } = queryString.parse(window.location.search);
    this.getGraphsList(page, s);
    return (
      <>
        <div className={`graphsList ${!graphsList.length ? 'empty' : ''}`}>
          {s ? (
            <h2 className="searchResult">
              {'Search Result forss: '}
              <span>{s}</span>
            </h2>
          ) : null}
          {graphsListStatus !== 'request' && _.isEmpty(graphsList) ? (
            <NoGraph />
          ) : null}
          {graphsList.map((graph) => (
            <GraphListItem key={graph.id} graph={graph} />
          ))}
        </div>
        <Pagination totalPages={totalPages} />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  graphsListStatus: state.graphs.graphsListStatus,
  graphsList: state.graphs.graphsList || [],
  graphsListInfo: state.graphs.graphsListInfo || {},
});

const mapDispatchToProps = {
  getGraphsListRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Home);

export default withRouter(Container);
