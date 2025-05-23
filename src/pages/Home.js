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
import GraphListItem from '../components/graphData/GraphListItem';
import GraphCardItem from '../components/graphData/GraphCardItem';
import { ReactComponent as PlusSvg } from '../assets/images/icons/plusGraph.svg';
import Button from '../components/form/Button';
import ChartUtils from '../helpers/Utils';

class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    graphsListInfo: PropTypes.object.isRequired,
    graphsListStatus: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
  }

  getGraphsList = memoizeOne((page, s) => {
    const order = JSON.parse(localStorage.getItem('/')) || 'newest';
    const limit = ChartUtils.getGraphListItemsLimit();
    this.props.getGraphsListRequest(page, { s, filter: order, limit });
  })

  startGraph = () => {
    window.location.href = '/graphs/create';
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
            <div className="no-graphs">
              <NoGraph />
              <Button className="startGraph" role="button" onClick={this.startGraph}>
                <PlusSvg />
                <h3>Create a Graph</h3>
              </Button>
            </div>
          ) : mode === 'list'
            ? <GraphListItem graphs={graphsList} headerTools="home" /> : <GraphCardItem graphs={graphsList} headerTools="home" />}
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
