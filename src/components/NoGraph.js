import React, { Component } from 'react';
import noGraph from '../assets/images/no-graph.png'; 
class Page404 extends Component {
  render() {
    return (
      <div className="no-graphs">
        <h1 className="title">No Graphs ...</h1>
        <img src={noGraph} className="no-graph-img" alt="No Graphs" />
      </div>
    );
  }
}

export default Page404;
