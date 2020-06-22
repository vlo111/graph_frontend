import React, { Component } from 'react';
import ReactCrop from 'react-image-crop';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ContextMenu from '../ContextMenu';
import Button from '../form/Button';
import Chart from '../../Chart';
import { setActiveButton, setGridIndexes } from '../../store/actions/app';

class Crop extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
  }

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

  crop = () => {
    const { crop } = this.state;
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();
    const {
      x, y, width, height,
    } = crop;
    const { x: x1, y: y1 } = Chart.calcScaledPosition(x, y);
    const { x: x2, y: y2 } = Chart.calcScaledPosition(x + width, y + height);

    nodes = nodes.map((d, i) => {
      d.index = i;
      return d;
    });
    nodes = nodes.filter((d) => d.fx >= x1 && d.fx < x2 && d.fy >= y1 && d.fy < y2);
    this.props.setGridIndexes('nodes', nodes.map((d) => d.index));


    const nodeName = nodes.map((d) => d.name);
    links = links.map((d, i) => {
      d.index = i;
      return d;
    });
    links = links.filter((d) => nodeName.includes(d.target) && nodeName.includes(d.source));
    this.props.setGridIndexes('links', links.map((d) => d.index));

    this.props.setActiveButton('data');
    this.setState({ active: false });
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
            <Button icon="fa-times" className="red" onClick={this.cancel}>Cancel</Button>
            <Button icon="fa-save" onClick={this.crop}>Crop</Button>
          </div>

        </div>
      </ReactCrop>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDespatchToProps = {
  setGridIndexes,
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(Crop);

export default Container;
