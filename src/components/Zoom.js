import React, { Component } from 'react';
import * as d3 from 'd3';
import Icon from './form/Icon';
import Chart from '../Chart';

class Zoom extends Component {
  zoom = (scale = 1) => {
    const x = +Chart.wrapper.attr('data-x') || 0;
    const y = +Chart.wrapper.attr('data-y') || 0;
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
  }

  zoomIn = () => {
    const scale = +Chart.wrapper.attr('data-scale') || 1;
    this.zoom(scale + 0.1);
  }

  zoomOut = () => {
    const scale = +Chart.wrapper.attr('data-scale') || 1;
    this.zoom(scale - 0.1);
  }

  reset = () => {
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(0,0).scale(1));
  }

  render() {
    return (
      <div id="chartZoom">
        <Icon value="fa-arrows-alt" onClick={this.reset} className="button" />
        <Icon value="fa-plus" onClick={this.zoomIn} className="button" />
        <Icon value="fa-minus" onClick={this.zoomOut} className="button" />
      </div>
    );
  }
}

export default Zoom;
