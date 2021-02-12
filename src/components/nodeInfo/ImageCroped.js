import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import Chart from '../../Chart';

class ImageCropped extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: -256,
      y: -192,
      clipPath: '',
      width: '',
      height: '',
      transform: [],
      fill: [],
    };
  }

  setSvgParams = memoizeOne((node) => {
    const s = Chart.nodesWrapper.select(`[data-i="${node.index}"] rect`);
    if (!s) {
      return;
    }
    const x = +s.attr('x');
    const y = +s.attr('y');
    const clipPath = s.attr('clip-path');
    const fill = s.attr('fill');
    const width = s.attr('width');
    const height = s.attr('height');
    const svgRect = this.wrapper.getBoundingClientRect();
    const transform = `translate(${svgRect.width / 2} ${svgRect.height / 2} )`;
    this.setState({
      x, y, clipPath, fill, transform, width, height,
    });
  })

  componentDidMount() {
    const { node } = this.props;
    this.setSvgParams(node);
  }

  render() {
    const { node } = this.props;
    const {
      x, y, clipPath, fill, transform, width, height
    } = this.state;
    if (this.wrapper) {
      this.setSvgParams(node);
    }
    return (
      <svg
        style={{ width: '100%', backgroundColor: '#F2F4FF' }}
        ref={(ref) => this.wrapper = ref}
        className="imageCropped"
      >
        <rect width={width} height={height} x={x} y={y} clipPath={clipPath} transform={transform} fill={fill} />
      </svg>
    );
  }
}

export default ImageCropped;
