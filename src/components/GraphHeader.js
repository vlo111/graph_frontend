import React, { Component } from 'react';
import SaveGraph from './chart/SaveGraph';

class GraphHeader extends Component {
  render() {
    return (
      <header id="graphHeader">
        <SaveGraph />
        <div id="headerPortal" />
      </header>
    );
  }
}

export default GraphHeader;
