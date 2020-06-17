import React, { Component } from 'react';
import ReactCrop from 'react-image-crop';
import ContextMenu from '../ContextMenu';
import Button from '../form/Button';
import Chart from '../../Chart';

class Crop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      crop: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    };
  }

  componentDidMount() {
    ContextMenu.event.on('crop', this.enableCrop);
  }


  handleCropChange = (crop) => {
    this.setState({ crop });
  }

  enableCrop = async () => {
    // fix react-image-crop issue
    await this.setState({ active: true });

    this.setState({ active: true });
  }

  cancel = () => {
    this.setState({ active: false });
  }

  save = () => {
    const { crop } = this.state;
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();
    const {
      x, y, width, height,
    } = crop;
    const { x: x1, y: y1 } = Chart.calcScaledPosition(x, y);
    const { x: x2, y: y2 } = Chart.calcScaledPosition(x + width, y + height);
    nodes = nodes.filter((d) => d.fx >= x1 && d.fx < x2 && d.fy >= y1 && d.fy < y2);

    const nodeName = nodes.map((d) => d.name);
    links = links.filter((d) => nodeName.includes(d.target) && nodeName.includes(d.source));

    console.log(nodes, links);
  }

  render() {
    const { crop, active } = this.state;
    if (!active) {
      return null;
    }
    return (
      <ReactCrop
        className="chartCrop"
        crop={crop}
        onChange={this.handleCropChange}
        renderComponent={<div />}
      >
        <div className="content">
          <div className="buttons">
            <Button icon="fa-times" className="red" onClick={this.cancel}>close</Button>
            <Button icon="fa-save" onClick={this.save}>Save</Button>
          </div>

        </div>
      </ReactCrop>
    );
  }
}

export default Crop;
