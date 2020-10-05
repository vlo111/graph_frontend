import React, { Component, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { getGraphsListRequest } from '../store/actions/graphs';
import Wrapper from '../components/Wrapper';
import Utils from '../helpers/Utils';
import Pagination from '../components/Pagination';
const GraphListFooter = lazy(() => import('../components/GraphListFooter'));


class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    graphsListInfo: PropTypes.object.isRequired,
  }

  getGraphsList = memoizeOne((page) => {
    this.props.getGraphsListRequest(page);
  })

  render() {
    const { graphsList, graphsListInfo: { totalPages } } = this.props;
    const { page = 1 } = queryString.parse(window.location.search);
    this.getGraphsList(page);
    return (
      <Wrapper className="homePage">
        <div className="graphsList">
          {graphsList.map((graph) => (
            <article key={graph.id} className="graphsItem">
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
                <img
                  className="thumbnail"
                  src={graph.thumbnail || Utils.fileSrc(`/public/uploads/thumbnails/${graph.id}.png`)}
                  alt={graph.title}
                />
              </Link>
              <Link to={`/graphs/preview/${graph.id}`}>
                <h3 className="title">{graph.title}</h3>
              </Link>
              <Link to={`/graphs/preview/${graph.id}`}>
                <p className="description">
                  {graph.description.length > 600 ? `${graph.description.substr(0, 600)}... ` : graph.description}
                </p>
              </Link>
              <Suspense fallback={<div>Loading...</div>}>
                <GraphListFooter graphId={graph.id} />
              </Suspense>
            </article>
          ))}
        </div>
        <Pagination totalPages={totalPages} />
      </Wrapper>
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

export default Container;
