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
    const nodes = Chart.getNodes();
    console.log(nodes);
    return (
      <div>
        <svg
          ref={(ref) => this.ref = ref}
          id="reactChartMap"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          {nodes.map((n) => (
            <circle key={n.id} cx={n.fx / 25} cy={n.fy / 25} r="8" fill="rgba(255,0,0,0.6)" />
          ))}
        </svg>
      </div>
    );
  }
}

export default ReactChartMap;
