import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { withRouter, Link } from 'react-router-dom';
import { getGraphsListRequest } from '../store/actions/graphs';
import Utils from '../helpers/Utils';
import Pagination from '../components/Pagination';
import GraphListFooter from '../components/GraphListFooter';
import GraphListHeader from '../components/GraphListHeader';
import NoGraph from "../components/NoGraph";

class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    graphsListInfo: PropTypes.object.isRequired,
  }

  getGraphsList = memoizeOne((page, s) => {
    this.props.getGraphsListRequest(page, { s });
  })

  render() {
    const { graphsList, graphsListInfo: { totalPages } } = this.props;
    const { page = 1, s } = queryString.parse(window.location.search);
    this.getGraphsList(page, s);
    return (
      <>
        <div className={`graphsList ${!graphsList.length ? 'empty' : ''}`}>
          {s ? (
            <h2 className="searchResult">{'Search Result for: '}<span>{s}</span></h2>
          ) : null}
          {graphsList.length ? graphsList.map((graph) => (
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
                <h3 className="title">
                  {graph.title}
                  {s && graph.status !== 'active' ? (
                    <span>{` (${graph.status})`}</span>
                  ) : null}
                </h3>
              </Link>
              <Link to={`/graphs/preview/${graph.id}`}>
                <p className="description">
                  {graph.description.length > 600 ? `${graph.description.substr(0, 600)}... ` : graph.description}
                </p>
              </Link>
              <Link to={`/graphs/preview/${graph.id}`}>
                <img
                  className="thumbnail"
                  src={graph.thumbnail || Utils.fileSrc(`/public/uploads/thumbnails/${graph.id}.png`)}
                  alt={graph.title}
                />
              </Link>
              <GraphListFooter graph={graph} />
            </article>
          )) : <NoGraph />}
        </div>
        <Pagination totalPages={totalPages} />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
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
