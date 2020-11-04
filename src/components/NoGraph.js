import React from 'react'; 
import noGraphImg from '../assets/images/no-graph.png'; 

export default function  NoGraph() { 

  return (
    <div className="no-graphs">
    <h1 className="title">No Graphs ...</h1>
    <img src={noGraphImg} className="no-graph-img" alt="No Graphs" />
  </div>
  );
};  

