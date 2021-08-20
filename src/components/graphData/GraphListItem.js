import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import queryString from 'query-string'; 
import GraphListFooter from './GraphListFooter'; 
import GraphDashboardSubMnus from './GraphListHeader';
import Tooltip from 'rc-tooltip';

class GraphListItem extends Component {
  static propTypes = {
    graph: PropTypes.object.isRequired,
  }


  render() {
    const { graphs, headerTools, mode } = this.props;
    const { s } = queryString.parse(window.location.search);
    if(!graphs && !graphs.length) return null;

    return (
      graphs ?
      graphs.map((graph) => (
        <article className="graphsItem" >
        <div>
          <Tooltip overlay={graph.title} placement="bottom">
            <h3> {graph.title.length > 18 ? `${graph.title.substring(0, 18)}...` : graph.title}</h3>
          </Tooltip>
          {(mode === 'card') ? (<p> {graph.description}</p>) : ''}
        </div>  
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
              <span className="nodesCount">{` ${graph.nodesCount} nodes `}</span>
            </div>
          </div>
        </div> 
        <GraphListFooter graph={graph} />   
        <div className="buttonHidden">
           <Link className="btn-edit view" to={`/graphs/update/${graph.id}`} replace> Edit </Link>   
           <Link className="btn-preview view" to={`/graphs/view/${graph.id}`} replace> Preview</Link>
        </div>
        <div className="unlucky">
          
        </div>
        <div className="sub-menus" >
              <GraphDashboardSubMnus graph={graph} headerTools={headerTools} />
        </div>
        
      </article>
      ))
 : <></>
    );
  }
}

export default GraphListItem;
