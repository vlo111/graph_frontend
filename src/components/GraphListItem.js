import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import GraphListFooter from './GraphListFooter';
import GraphListHeader from './GraphListHeader';

class GraphListItem extends Component {
  static propTypes = {
    graph: PropTypes.object.isRequired,
  }

  render() {
    const { graph } = this.props;
    const { s } = queryString.parse(window.location.search);

    return (
      <article className="graphsItem">
        <GraphListHeader graph={graph} />
        <div className="top">
          <img
            className="avatar"
            src={graph.user.avatar}
            alt={graph.user.name}
          />
          <div className="infoWrapper">
            <Link to={`/profile/${graph.user.id}`}>
              <span className="author">{`${graph.user.firstName} ${graph.user.lastName}`}</span>
            </Link>
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
            src={`${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`}
            alt={graph.title}
          />
        </Link>
        <GraphListFooter graph={graph} />
      </article>
    );
  }
}

export default GraphListItem;
