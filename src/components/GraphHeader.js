import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import SaveGraph from './chart/SaveGraph';
import Filters from './filters/Filters';

class GraphHeader extends Component {
  render() {
    return (
      <header id="graphHeader">
        <SaveGraph />
        <div id="headerPortal" />
        <Filters />
        <Link className="ghButton" to="/">graphs list</Link>
      </header>
    );
  }
}

export default GraphHeader;
