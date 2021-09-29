import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { getGraphsListRequest } from '../../store/actions/graphs';
import Pagination from '../../components/Pagination';
import GraphCardItem from '../../components/graphData/GraphCardItem';
import GraphListItem from '../../components/graphData/GraphListItem';
import NoGraph from '../../components/NoGraph';

class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    graphsListInfo: PropTypes.object.isRequired,
    graphsListStatus: PropTypes.string.isRequired,
    headerTools: PropTypes.object.isRequired,
  }

  
  getGraphsList = memoizeOne((page = 1, s) => {
    const status = 'template';
    const order = JSON.parse(localStorage.getItem(`/${status}s`));
    this.props.getGraphsListRequest(page, { s, filter: order, status });
  })
  
  handleClick = (list) => {
    this.setState({ dataGrid: list });
  }
  
  
  render() {
    const {
      graphsList, graphsListStatus, graphsListInfo: { totalPages }, mode,
    } = this.props;
    const { page = 1, s } = queryString.parse(window.location.search);
    this.getGraphsList(page, s);
    return (
      <>
        <div className={`${mode === 'tab_card' ? 'graphsCard' : 'graphsList'} ${!graphsList.length ? 'empty' : ''}`}>
          {s ? (
            <h2 className="searchResult">
              {'Search Result for: '}
              <span>{s}</span>
            </h2>
          ) : null}
          {graphsListStatus !== 'request' && _.isEmpty(graphsList) ? (
            <NoGraph />
          ) : mode === 'list' ? <GraphListItem graphs={graphsList}  /> : <GraphCardItem graphs={graphsList} />}
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
)(Home);

export default withRouter(Container);
