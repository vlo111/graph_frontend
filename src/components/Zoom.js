import React, { Component } from 'react';
import * as d3 from 'd3';
import Icon from './form/Icon';
import Chart from '../Chart';
import ChartUtils from '../helpers/ChartUtils';
import { toggleGraphMap } from "../store/actions/app";
import { connect } from "react-redux";
import memoizeOne from "memoize-one";

class Zoom extends Component {
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    Chart.event.on('render', this.handleRender)

  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }


  handleRender = (() => {
    const {
      width, height, min, max,
    } = ChartUtils.getDimensions(false);
    if(!width){
      return
    }
    if (Chart.svg) {
      window.removeEventListener('keydown', this.handleKeyDown);
      const scaleW = (window.innerWidth - 450) / width;
      const scaleH = (window.innerHeight - 70) / height;
      const scale = Math.min(scaleW, scaleH);
      let left = min[0] * scale * -1 + 201;
      let top = min[1] * scale * -1 + 75;
      // top += 70 / scale
      // left += 600 * scale
      console.log(scaleH, scaleW)
      if (scaleH < scaleW) {
        console.log(2323333)
        // left += (min[1] + width) * scale / 2
      } else {
        console.log(2222)
        // top += (min[0] + height) * scale / 2
      }
      Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(left, top).scale(scale));
    }
  })

  handleKeyDown = (ev) => {
    ChartUtils.keyEvent(ev);
    if (ev.chartEvent && ev.ctrlPress) {
      if (ev.keyCode === 187) {
        ev.preventDefault();
        this.zoomIn();
      } else if (ev.keyCode === 189) {
        ev.preventDefault();
        this.zoomOut();
      } else if (ev.keyCode === 48) {
        ev.preventDefault();
        this.zoom();
      }
    }
  }

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
    const { singleGraph } = this.props;
    return (
      <div id="chartZoom">
        <Icon value="fa-map-o" style={{ marginLeft: 7, marginRight: 0 }} onClick={this.props.toggleGraphMap}
              className="button"/>
        <Icon value="fa-arrows-alt" onClick={() => this.zoom()} className="button"/>
        <Icon value="fa-plus" onClick={this.zoomIn} className="button"/>
        <Icon value="fa-minus" onClick={this.zoomOut} className="button"/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  showGraphMap: state.app.showGraphMap,
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {
  toggleGraphMap
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Zoom);

export default Container;
