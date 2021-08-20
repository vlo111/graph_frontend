import React, {Component} from 'react';
import noGraphSvg from '../assets/images/icons/sad.svg';
import { ReactComponent as PlusSvg } from '../assets/images/icons/plusGraph.svg';


class NoGraph extends Component {
  static propTypes = {

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




 render(){

  return (
    <div className="no-graphs">
      <img src={noGraphSvg} className="no-graph-img" alt="No Graphs" />
      <h1 className="title">You have no graph yet</h1> 
       <div className='startGraph' onClick={this.startGraph}>
           <PlusSvg />
          <h3>Start Graph</h3>
       </div>
    </div>
    
  );
};
} 

export default   NoGraph
