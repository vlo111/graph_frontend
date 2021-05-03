import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import queryString from 'query-string'; 
import GraphListFooter from './GraphListFooter'; 
import GraphDashboardSubMnus from './GraphListHeader';

class GraphListItem extends Component {
  static propTypes = {
    graph: PropTypes.object.isRequired,
  }

  render() {
    const { graph, headerTools } = this.props;
    const { s } = queryString.parse(window.location.search);

    return (
      <article className="graphsItem" >
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
        <div className="dashboard" >
          <div className="dashboard-onhover">
            <div className="dashboard-onhover-content">
            <div className="dashboard-buttons flex-column d-flex" >
                  <h3 className="dashboard-title">
                  {graph.title}
                  {s && graph.status !== 'active' ? (
                    <span>{` (${graph.status})`}</span>
                  ) : null}
                </h3>      
                <p className="dashboard-description">
                  {graph.description.length > 600 ? `${graph.description.substr(0, 600)}... ` : graph.description}
                </p> 
                <Link className="ghButton view" to={`/graphs/update/${graph.id}`} replace> Edit </Link>
                <Link className="ghButton view" to={`/graphs/view/${graph.id}`} replace> Preview</Link>
            </div>
            <div className="sub-menus" >
              <GraphDashboardSubMnus graph={graph} headerTools={headerTools} />
            </div>
            </div>
          </div> 
          <h3 className="title">
            {graph.title}
            {s && graph.status !== 'active' ? (
              <span>{` (${graph.status})`}</span>
            ) : null}
          </h3>      
          <p className="description">
            {graph.description.length > 600 ? `${graph.description.substr(0, 600)}... ` : graph.description}
          </p>       
          <img
            className="thumbnail"
            src={`${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`}
            alt={graph.title}
          />
        </div>
        <GraphListFooter graph={graph} />


      </article>
    );
  }
}

export default GraphListItem;
