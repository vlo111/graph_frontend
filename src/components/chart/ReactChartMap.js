import React, { Component } from 'react';
import Chart from "../../Chart";

class ReactChartMap extends Component {
  componentDidMount() {
    Chart.event.on('zoom', this.handleChartZoom)
  }

  handleChartZoom = (ev, d) => {
    console.log(d)
  }

  render() {
    return null;
    return (
      <div>
        <svg ref={ref => this.ref = ref} id="reactChartMap" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
          <use href="#reactChart" />
        </svg>
      </div>
    );
  }
}

export default ReactChartMap;
