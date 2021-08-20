import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { withRouter } from 'react-router-dom';
import { getGraphsListRequest } from '../store/actions/graphs';
import Pagination from '../components/Pagination';
import NoGraph from '../components/NoGraph';
import GraphListItem from "../components/graphData/GraphListItem";
import GraphCardItem from "../components/graphData/GraphCardItem";

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

  componentDidMount() {
    const order = JSON.parse(localStorage.getItem('/'));

    const { page = 1, s } = queryString.parse(window.location.search);

    this.props.getGraphsListRequest(page, { s, filter: order });
  }

  render() {
    const { graphsList, graphsListStatus, graphsListInfo: { totalPages }, mode } = this.props;
    const { page = 1, s } = queryString.parse(window.location.search);
    this.getGraphsList(page, s);

    return (
      <>
        <div className={`${mode === 'tab_card' ? 'graphsCard' : 'graphsList'} ${!graphsList.length ? 'empty' : ''}`} >
          {s ? (
            <h2 className="searchResult">
              {'Search Result for: '}
              <span>{s}</span>
            </h2>
          ) : null}
          {graphsListStatus !== 'request' && _.isEmpty(graphsList) ? (
            <NoGraph />
          ) : mode === 'list' ? <GraphListItem graphs={graphsList} /> : <GraphCardItem graphs={graphsList} />}
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
