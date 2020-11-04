import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import _ from 'lodash'
import { Link, withRouter } from 'react-router-dom';
import { getGraphsListRequest } from '../../store/actions/graphs';
import Pagination from '../../components/Pagination';
import GraphListFooter from '../../components/GraphListFooter';
import GraphListHeader from '../../components/GraphListHeader';
import NoGraph from "../../components/NoGraph";

class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    graphsListInfo: PropTypes.object.isRequired,
    graphsListStatus: PropTypes.string.isRequired, 
  }

  getGraphsList = memoizeOne((page, s) => {
    this.props.getGraphsListRequest(page, { s, status: 'template' });
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
              {'Search Result for: '}
              <span>{s}</span>
            </h2>
          ) : null}
          {graphsListStatus !== 'request' && _.isEmpty(graphsList) ? (
            <NoGraph />
          ) : null}
          {graphsList.map((graph) => (
            <article key={graph.id} className="graphsItem">
              <GraphListHeader graph={graph} />
              <div className="top">
                <img
                  className="avatar"
                  src={graph.user.avatar}
                  alt={graph.user.name}
                />
                <div className="infoWrapper">
                  <a href="/">
                    <span className="author">{`${graph.user.firstName} ${graph.user.lastName}`}</span>
                  </a>
                  <div className="info">
                    <span>{moment(graph.updatedAt).calendar()}</span>
                    <span>{`${graph.nodesCount} nodes`}</span>
                  </div>
                </div>
              </div>
              <Link to={`/graphs/preview/${graph.id}`}>
                <h3 className="title">{graph.title}</h3>
              </Link>
              <Link to={`/graphs/preview/${graph.id}`}>
                <p className="description">{graph.description}</p>
              </Link>
              <Link to={`/graphs/preview/${graph.id}`}>
                <img className="thumbnail" src={graph.thumbnail} alt={graph.title} />
              </Link>
              <GraphListFooter graph={graph} />
            </article>
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
