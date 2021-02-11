import React, { Component } from 'react';
import Chart from "../../../Chart";

class FolderCloseIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 500,
      y: 500,
      width: 225,
      height: 225,
      nodeId: 1,
    };
  }

  componentDidMount() {
    Chart.event.on('node.click', this.handleNodeClick);
  }

  handleNodeClick = (ev) => {
    console.log(ev);
  }

  render() {
    const {
      x, y, width, height, nodeId,
    } = this.state;
    if (!nodeId) {
      return null;
    }
    return (
      <g id="nodeResizeIcons" transform={`translate(${x} ${y})`}>
        <g className="square" transform="rotate(-45)">
          <rect width="14" height="14" x={0} y={0} transform="rotate(45)" />
          <rect width="14" height="14" x={width} y={0} transform="rotate(45)" />
          <rect width="14" height="14" x={width} y={height} transform="rotate(45)" />
          <rect width="14" height="14" x={0} y={height} transform="rotate(45)" />
        </g>
        <g className="circle">
          <circle r="8" cx={-4} cy={-4} />
          <circle r="8" cx={width + 18} cy={-4} />
          <circle r="8" cx={width + 18} cy={height + 18} />
          <circle r="8" cx={-4} cy={height + 18} />
        </g>
      </g>
    );
  }
}

export default FolderCloseIcon;
