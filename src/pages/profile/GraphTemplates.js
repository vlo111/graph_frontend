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
import GraphListFooter from '../../components/graphData/GraphListFooter';
import GraphDashboardSubMnus from '../../components/graphData/GraphListHeader';

import NoGraph from "../../components/NoGraph";

class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    graphsCard: PropTypes.array.isRequired,
    graphsListInfo: PropTypes.object.isRequired,
    graphsListStatus: PropTypes.string.isRequired, 
  }

  constructor(props) {
    super(props);
    this.state = {dataGrid: false}
  }
  getGraphsList = memoizeOne((page = 1, s) => {

    const status = 'template';
    
    const order = JSON.parse(localStorage.getItem(`/${status}`));

    this.props.getGraphsListRequest(page, { s, filter: order, status });
  })

  
  componentDidMount() {
    const order = JSON.parse(localStorage.getItem('/templates'));

    const { page = 1 } = queryString.parse(window.location.search);
    
    this.props.getGraphsListRequest(page, { filter: order, status: 'template' });
  }

  handleClick = (list) => {  
    this.setState({ dataGrid: list });
  }

  render() {
    const { dataGrid } = this.state;
    const { graphsList, graphsListStatus, graphsListInfo: { totalPages }, headerTools,mode } = this.props;
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
          ) : null}            
              {graphsList.map((graph) => (
                <article key={graph.id} className="graphsItem"> 
                <div>
                   <h3> {graph.title.length > 18 ? `${graph.title.substring(0, 18)}...` : graph.title}</h3>
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
                        <span className="nodesCount">{` ${graph.nodesCount} nodes`}</span>
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
