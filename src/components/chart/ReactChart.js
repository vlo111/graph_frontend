import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import Chart from '../../Chart';
import { showNodeInfo, toggleNodeModal } from '../../store/actions/app';
import ContextMenu from '../ContextMenu';

class ReactChart extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
    showNodeInfo: PropTypes.func.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
  }

  async componentDidMount() {
    const data = { nodes: [], links: [] };
    data.nodes.push({
      name: 'Instagram',
      value: 5,
      type: '2',
      fx: 250,
      fy: 250,
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/1024px-Instagram_logo_2016.svg.png',
    });

    data.nodes.push({
      name: 'Hell',
      value: 5,
      type: '2',
      fx: 500,
      fy: 250,
    });

    Chart.render(data);

    Chart.event.on('node.click', this.deleteNode);
    ContextMenu.event.on('node.delete', this.deleteNode);

    Chart.event.on('node.mouseenter', this.handleNodeMouseEnter);

    Chart.event.on('node.mouseleave', this.handleNodeMouseLeave);

    Chart.event.on('link.click', this.deleteLink);
    ContextMenu.event.on('link.delete', this.deleteLink);

    Chart.event.on('click', this.addNewItem);

    Chart.event.on('line.new', this.handleAddNewLine);
  }

  componentWillUnmount() {
    Chart.unmount();
  }

  handleNodeMouseEnter = async (d) => {
    this.showInfo = d.name;
    clearTimeout(this.showInfoTimout);
    this.showInfoTimout = setTimeout(() => {
      this.props.showNodeInfo(this.showInfo);
    }, 1000);
  }

  handleNodeMouseLeave = () => {
    this.showInfo = '';
    clearTimeout(this.showInfoTimout);
  }


  addNewItem = () => {
    const { target } = d3.event;
    if (target.tagName !== 'svg'
      || Chart.activeButton !== 'create'
      || Chart.newLink.attr('data-source')) {
      return;
    }
    const { x, y } = Chart.getScaledPosition();

    this.props.toggleNodeModal({
      fx: x,
      fy: y,
    });
  }

  deleteLink = (d) => {
    if (Chart.activeButton !== 'delete' && !d.contextMenu) {
      return;
    }
    const links = Chart.getLinks();
    links.splice(d.index, 1);
    Chart.render({ links });
  }


  deleteNode = (d) => {
    if (Chart.activeButton !== 'delete' && !d.contextMenu) {
      return;
    }
    const nodes = Chart.getNodes();
    let links = Chart.getLinks();

    nodes.splice(d.index, 1);

    links = links.filter((l) => l.source !== d.name && l.target !== d.name);

    Chart.render({ links, nodes });
  }

  handleAddNewLine = (d) => {
    const { source, target } = d;
    const links = Chart.getLinks();
    links.push({
      source,
      target,
      value: 2,
    });
    Chart.render({ links });
  }

  render() {
    const { activeButton } = this.props;
    return (
      <div id="graph" data-active={activeButton} className={activeButton} />
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});
const mapDespatchToProps = {
  showNodeInfo,
  toggleNodeModal,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(ReactChart);

export default Container;
