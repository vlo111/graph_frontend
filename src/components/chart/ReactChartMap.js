import React, { Component } from 'react';
import Chart from '../../Chart';

class ReactChartMap extends Component {
  componentDidMount() {
    Chart.event.on('zoom', this.handleChartZoom);
  }

  handleChartZoom = (ev, d) => {
    return;
    const { width, height } = document.querySelector('#reactChart').getBoundingClientRect();
    console.log(width / d.transform.k);
  }

  render() {
    return null;
    const nodes = Chart.getNodes();
    console.log(nodes)
    return (
      <div>
        <svg
          ref={(ref) => this.ref = ref}
          id="reactChartMap"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <use href="#reactChart" />
        </svg>
      </div>
    );
  }
}

export default ReactChartMap;
