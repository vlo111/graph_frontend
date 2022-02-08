import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import { getGraphsListRequest } from '../store/actions/graphs';
import NoGraph from '../components/NoGraph';
import GraphListItem from '../components/graphData/GraphListItem';
import Pagination from '../components/Pagination';
import GraphCardItem from '../components/graphData/GraphCardItem';
import ChartUtils from '../helpers/Utils';

class Public extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    graphsListInfo: PropTypes.object.isRequired,
    graphsListStatus: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
  }

  getGraphsList = memoizeOne((page) => {
    const order = JSON.parse(localStorage.getItem('/public')) || 'newest';
    const limit = ChartUtils.getGraphListItemsLimit();
    this.props.getGraphsListRequest(page, { filter: order, publicGraph: 1, limit });
  })

  render() {
    const {
      graphsList, graphsListStatus, graphsListInfo: { totalPages }, mode,
    } = this.props;
    const { page = 1 } = queryString.parse(window.location.search);
    this.getGraphsList(page);
    return (
      <>
        <div className={`${mode === 'tab_card' ? 'graphsCard' : 'graphsList'} ${!graphsList.length ? 'empty' : ''}`}>
          {graphsListStatus !== 'request' && _.isEmpty(graphsList) ? (
            <div className="no-graphs">
              <NoGraph />
            </div>
          ) : mode === 'list'
            ? <GraphListItem graphs={graphsList} headerTools="public" /> : <GraphCardItem graphs={graphsList} headerTools="public" />}
        </div>
        {graphsList.length ? <Pagination totalPages={totalPages} /> : null}
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
)(Public);

export default withRouter(Container);
