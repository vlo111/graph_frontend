import React from 'react'; 
import noGraphSvg from '../assets/images/no_result.svg'; 

export default function  NoGraph() { 

  return (
    <div className="no-graphs">
    <h1 className="title">No Graphs ...</h1>
    <img src={noGraphSvg} className="no-graph-img" alt="No Graphs" />
  </div>
  );
};  

