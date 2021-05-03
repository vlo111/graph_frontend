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
import GraphDashboardSubMnus from '../../components/GraphListHeader';

import NoGraph from "../../components/NoGraph";

class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    graphsListInfo: PropTypes.object.isRequired,
    graphsListStatus: PropTypes.string.isRequired, 
  }

  constructor(props) {
    super(props);
    this.state = {dataGrid: false}
  }
  getGraphsList = memoizeOne((page, s) => {
    this.props.getGraphsListRequest(page, { s, status: 'template' });
  })

  handleClick = (list) => {  
    this.setState({ dataGrid: list });
  }
  render() {
    const { dataGrid } = this.state;
    const { graphsList, graphsListStatus, graphsListInfo: { totalPages }, headerTools } = this.props;
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
                  <h3 className="title">{graph.title}</h3>  
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
