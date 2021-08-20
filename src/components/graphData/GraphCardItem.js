import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import queryString from 'query-string'; 
import GraphListFooter from './GraphListFooter'; 
import GraphDashboardSubMnus from './GraphListHeader';
import { ReactComponent as PlusSvg } from '../../assets/images/icons/plusGraph.svg';


class GraphCardItem extends Component {
  static propTypes = {
    graph: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      graphs: [],
    };
  }

  startGraph = () => {
    window.location.href = '/graphs/create';
  }

  showCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'flex'
  }

  hideCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'none'
  }

  updateGraph = (graph) => {
    const { graphs } = this.props;

    graphs.map(p => {
      if(p.id === graph.id) {
        p.title = graph.title
        p.description = graph.description
      }
    })

    this.setState({
      graphs
    })
  }

  render() {
    let { graphs, headerTools, mode } = this.props;
    const { graphs: graphState} = this.state;

    if(graphState && graphState.length) {
      graphs = graphState;
    }

    const { s } = queryString.parse(window.location.search);
    if(!graphs && !graphs.length) return null;

    return (
      <>
      <div className='startGraph' onClick={this.startGraph}>
          <PlusSvg />
          <h3>Start Graph</h3>
      </div>
      { graphs.map((graph) => (
        <article className="graphs">
        <div className="top">
         <div className='infoContent'>
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
                 <span>{moment(graph.updatedAt).startOf('Day').fromNow()}</span>     
                 <span className="nodesCount">{` ${graph.nodesCount} nodes `}</span>
               </div>
             </div>
         </div>
         <div className="sub-menus" >
            <GraphDashboardSubMnus updateGraph={this.updateGraph} graph={graph} headerTools={headerTools} />
         </div>
        </div> 
        <div>
             <h3> {graph.title.length > 18 ? `${graph.title.substring(0, 18)}...` : graph.title}</h3>
             <div className='descriptionGraph'>
                  <span> {graph.description.length > 40 ? `${graph.description.substring(0, 40)}...` : graph.description}</span>
             </div>
        </div>

         <div onMouseOver={() => this.showCardOver(graph.id)} onMouseOut={() => this.hideCardOver(graph.id)} className='graph-image'>

         <div className={`buttonView graph-card_${graph.id}`}>
              <Link className="btn-edit view" to={`/graphs/update/${graph.id}`} replace> Edit </Link>   
              <Link className="btn-preview view" to={`/graphs/view/${graph.id}`} replace> Preview</Link>
           </div> 
           <img
                className="thumbnail"
                src={`${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`}
                alt={graph.title}
            /> 
         </div>
        <GraphListFooter graph={graph} />   
      </article> 
      ))} 
      
      </>
    );
  }
}

export default GraphCardItem;
