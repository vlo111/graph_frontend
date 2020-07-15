import React, { Component } from 'react';
import SaveGraph from './chart/SaveGraph';
import Filters from './filters/Filters';

class GraphHeader extends Component {
  render() {
    return (
      <header id="graphHeader">
        <SaveGraph />
        <div id="headerPortal" />
        <Filters />
      </header>
    );
  }
}

export default GraphHeader;
