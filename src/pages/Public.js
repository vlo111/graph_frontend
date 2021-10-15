import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { getPublicListRequest } from '../store/actions/graphs';
import NoGraph from '../components/NoGraph';
import GraphListItem from '../components/graphData/GraphListItem';
import Pagination from '../components/Pagination';
import GraphCardItem from '../components/graphData/GraphCardItem';

class Public extends Component {
  static propTypes = {
    getPublicListRequest: PropTypes.func.isRequired,
    publicGraphList: PropTypes.array.isRequired,
  }

  componentDidMount() {
    const order = JSON.parse(localStorage.getItem('/Public')) || 'newest';
    const { page = 1 } = queryString.parse(window.location.search);
    this.props.getPublicListRequest(page);
  }

  render() {
    const {
      publicGraphList, graphsListStatus, graphsListInfo: { totalPages }, mode,
    } = this.props; 
    return (
      <>
      <div className={`${mode === 'tab_card' ? 'graphsCard' : 'graphsList'} ${!publicGraphList.length ? 'empty' : ''}`}>
        {graphsListStatus !== 'request' && _.isEmpty(publicGraphList) ? (
            <div className="no-graphs">
              <NoGraph />
            </div>
          ) : mode === 'list'
            ? <GraphListItem graphs={publicGraphList}  headerTools="public" /> : <GraphCardItem graphs={publicGraphList} headerTools="public" />}
        </div>
        {publicGraphList.length >5 ? <Pagination totalPages={totalPages} /> : null}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  graphsListStatus: state.graphs.graphsListStatus,
  publicGraphList: state.graphs.publicGraphList || [],
  graphsListInfo: state.graphs.graphsListInfo || {},
});

const mapDispatchToProps = {
  getPublicListRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Public);

export default withRouter(Container);

