import React, { Component } from 'react';
import * as d3 from 'd3';
import Chart from '../Chart';
import Icon from './form/Icon';
import Outside from './Outside';
import ChartUtils from '../helpers/ChartUtils';

const MODAL_WIDTH = 300;

class NodeDescription extends Component {
  constructor(props) {
    super(props);
    this.showInfoTimout = null;
    this.state = {
      node: null,
    };
  }

  componentDidMount() {
    Chart.event.on('node.mouseenter', this.showNodeInfo);
    Chart.event.on('node.mouseleave', this.handleMouseLeave);
    Chart.event.on('node.dragstart', this.handleDragStart);
  }

  componentWillUnmount() {
    clearTimeout(this.showInfoTimout);
  }

  getNode = (name) => {
    const nodes = Chart.getNodes();
    const node = nodes.find((n) => n.name === name);
    if (node) {
      node.index = nodes.findIndex((n) => n.name === name);
    }
    return node;
  }

  handleDragStart = () => {
    clearTimeout(this.showInfoTimout);
    this.setState({ node: null });
  }

  handleMouseLeave = () => {
    clearTimeout(this.showInfoTimout);
  }

  showNodeInfo = async (d) => {
    clearTimeout(this.showInfoTimout);
    this.showInfoTimout = setTimeout(() => {
      this.setState({
        node: this.getNode(d.name),
      });
    }, 1500);
  }

  hideInfo = () => {
    this.setState({ node: null });
  }

  render() {
    const { node } = this.state;
    if (!node) {
      return null;
    }
    const { x, y } = ChartUtils.getNodeDocumentPosition(node.index);
    const { scale } = ChartUtils.calcScaledPosition();
    const nodeWidth = ChartUtils.getRadiusList()[node.index] * 2;
    const top = y + (nodeWidth * scale) + 5;
    let left = x;

    if (left + MODAL_WIDTH > window.innerWidth) {
      left = window.innerWidth - MODAL_WIDTH - 5;
    }

    const mainLink = '';
    return (
      <Outside onClick={this.hideInfo}>
        <div onMouseLeave={this.hideInfo} data-node-info={node.index} id="nodeDescription" style={{ top, left }}>
          <Icon className="close" value="fa-close" onClick={this.hideInfo} />
          <div className="left">
            {node.icon ? (
              <img src={node.icon} alt="icon" width={50} height={50} />
            ) : (
              <span style={{ background: Chart.color()(node) }} className="icon">{node.type[0]}</span>
            )}
          </div>
          <div className="right">
            {node.link ? (
              <a className="title" href={node.link} title={mainLink.name} target="_blank" rel="noreferrer">
                {node.name}
              </a>
            ) : (
              <h3 className="title">{node.name}</h3>
            )}
            <h4 className="type">
              {node.type}
            </h4>
            {!!node.description && (
              <p className="description" dangerouslySetInnerHTML={{ __html: node.description }} />
            )}
          </div>
        </div>
      </Outside>
    );
  }
}

export default NodeDescription;
