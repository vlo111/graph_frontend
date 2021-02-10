import React, { Component } from 'react';

class FolderCloseIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 500,
      y: 500,
      width: 225,
      height: 225,
    };
  }

  render() {
    const {
      x, y, width, height,
    } = this.state;
    return (
      <g transform={`translate(${x} ${y})`}>
        <g transform="rotate(-45)">
          <rect width="18" height="18" x={5} y={5} transform="rotate(45)" />
          <rect width="18" height="18" x={width} y={5} transform="rotate(45)" />
          <rect width="18" height="18" x={width} y={height} transform="rotate(45)" />
          <rect width="18" height="18" x={5} y={height} transform="rotate(45)" />
        </g>
        <g>
          <circle r="11" cx={0} cy={0} />
          <circle r="11" cx={width + 25} cy={0} />
          <circle r="11" cx={width + 25} cy={height + 25} />
          <circle r="11" cx={0} cy={height + 25} />
        </g>
      </g>
    );
  }
}

export default FolderCloseIcon;
