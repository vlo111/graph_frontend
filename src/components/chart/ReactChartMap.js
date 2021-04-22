import React, { Component } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';

class ReactChartMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transform: {
        k: 1,
        x: 0,
        y: 0,
      },
    };
  }

  componentDidMount() {
    Chart.event.on('zoom', this.handleChartZoom);
    Chart.event.on('auto-save', this.autoSave);
  }

  autoSave = () => {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => this.forceUpdate(), 500);
  }

  handleChartZoom = (ev, d) => {
    clearTimeout(this.timeOutZoom);
    this.timeOutZoom = setTimeout(() => {
      this.setState({ transform: d.transform });
    }, 200);
  }

  handleMouseDown = () => {
    this.dragActive = true;
  }

  handleMouseUp = () => {
    this.dragActive = false;
  }

  handleMouseMove = (ev) => {
    if (!this.dragActive) {
      return;
    }
    console.log(ev)
  }

  render() {
    const { transform } = this.state;
    const nodes = Chart.getNodes();
    const labels = Chart.getLabels();
    const { innerWidth, innerHeight } = window;
    const {
      width, height, min, max,
    } = ChartUtils.getDimensions();

    const originalWidth = max[0] - min[0];
    const originalHeight = max[1] - min[1];

    return (
      <div className="reactChartMapWrapper">
        <svg
          ref={(ref) => this.ref = ref}
          id="reactChartMap"
          viewBox={`${min[0]} ${min[1]} ${originalWidth} ${originalHeight}`}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <g>
            {labels.filter((l) => l.type !== 'folder').map((l) => {
              const square = ChartUtils.pathToSquare(l.d);
              return (
                <rect
                  key={l.id}
                  width={square.width}
                  height={square.height}
                  x={square.x}
                  y={square.y}
                  fill={ChartUtils.labelColors(l)}
                />
              );
            })}
            {nodes.map((n) => (
              <circle
                key={n.id}
                cx={+n.fx.toFixed(3)}
                cy={+n.fy.toFixed(3)}
                r="50"
                fill={ChartUtils.nodeColor(n)}
              />
            ))}

            <rect
              fill="red"
              className="viewArea"
              x={(-1 * transform.x) / transform.k}
              y={(-1 * transform.y) / transform.k}
              strokeWidth={originalWidth / window.innerWidth * 2}
              width={(originalWidth / window.innerWidth + window.innerWidth) / transform.k}
              height={(originalHeight / window.innerHeight + window.innerHeight / transform.k)}
              onMouseDown={this.handleMouseDown}
              onMouseUp={this.handleMouseUp}
              onMouseMove={this.handleMouseMove}
            />
          </g>
        </svg>

      </div>
    );
  }
}

export default ReactChartMap;
