import React, { Component } from 'react';
import * as d3 from 'd3';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';

class ReactChartMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transform: {
        k:  +Chart.wrapper.attr('data-scale') || 1,
        x: Chart.wrapper.attr('data-x') || 0,
        y: Chart.wrapper.attr('data-y') || 0,
      },
    };
  }

  componentDidMount() {
    Chart.event.on('zoom', this.handleChartZoom);
    Chart.event.on('auto-save', this.autoSave);
    this.viewArea = d3.select('#reactChartMap .viewArea');
    this.viewArea.call(
      d3.drag()
        .on('drag', this.handleDrag),
    );

    this.board = d3.select('#reactChartMap .board')
    console.log(this.board)
    // this.board.on('click', this.handleBoardClick)
  }

  componentWillUnmount() {
    this.viewArea.call(
      d3.drag()
        .on('drag', null),
    );
    this.board.on('click', null)
  }


  autoSave = () => {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => this.forceUpdate(), 500);
  }
  handleBoardClick = (ev) => {
    const {transform  } = this.state;
    const { layerX, layerY } = ev;
    const {
      width, height, min, max,
    } = ChartUtils.getDimensions();
    const  x = layerX  + (min[0] /4);
    const  y = layerY  * (min[1] / 4);
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(x, y).scale(transform.k));
  }

  handleChartZoom = (ev, d) => {
    clearTimeout(this.timeOutZoom);
    this.timeOutZoom = setTimeout(() => {
      this.setState({ transform: d.transform });
    }, 200);
  }

  zoom = (scale = 1, x = 0, y = 0) => {
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
  }

  handleDrag = (ev) => {
    const { transform } = this.state;
    const { dx, dy } = ev;
    transform.x -= (dx * transform.k);
    transform.y -= (dy * transform.k);
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k));
    this.setState({ transform });
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
    let r = originalWidth / 180;
    if (r > 150) {
      r = 150
    } else if (r < 50) {
      r = 50;
    }
    return (
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
              r={+r.toFixed(3)}
              fill={ChartUtils.nodeColor(n)}
            />
          ))}
          {/*<rect className="board" opacity={0} width={originalWidth} height={originalHeight} x={min[0]} y={min[1]}/>*/}
          <rect
            className="viewArea"
            x={(-1 * transform.x) / transform.k}
            y={(-1 * transform.y) / transform.k}
            strokeWidth={originalWidth / window.innerWidth * 2}
            width={(originalWidth / window.innerWidth + window.innerWidth) / transform.k}
            height={(originalHeight / window.innerHeight + window.innerHeight / transform.k)}
          />
        </g>
      </svg>
    );
  }
}

export default ReactChartMap;
