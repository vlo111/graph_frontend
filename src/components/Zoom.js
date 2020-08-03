import React, { Component } from 'react';
import * as d3 from 'd3';
import Icon from './form/Icon';
import Chart from '../Chart';

class Zoom extends Component {
  zoom = (scale = 1, x = 0, y = 0) => {
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
  }

  zoomIn = () => {
    let scale = +Chart.wrapper.attr('data-scale') || 1;
    let x = +Chart.wrapper.attr('data-x') || 0;
    let y = +Chart.wrapper.attr('data-y') || 0;

    if (scale > 0.9) {
      scale += 0.1;
      x -= 100 * scale;
      y -= 100 * scale;
    } else {
      scale += 0.01;
      x -= 10 * scale;
      y -= 10 * scale;
    }
    this.zoom(scale, x, y);
  }

  zoomOut = () => {
    let scale = +Chart.wrapper.attr('data-scale') || 1;
    let x = +Chart.wrapper.attr('data-x') || 0;
    let y = +Chart.wrapper.attr('data-y') || 0;
    if (scale < 0.02) {
      return;
    }
    if (scale < 0.2) {
      scale -= 0.01;
      x += 10 * scale;
      y += 10 * scale;
    } else {
      scale -= 0.1;
      x += 100 * scale;
      y += 100 * scale;
    }

    this.zoom(scale, x, y);
  }

  render() {
    return (
      <div id="chartZoom">
        <Icon value="fa-arrows-alt" onClick={() => this.zoom()} className="button" />
        <Icon value="fa-plus" onClick={this.zoomIn} className="button" />
        <Icon value="fa-minus" onClick={this.zoomOut} className="button" />
      </div>
    );
  }
}

export default Zoom;
