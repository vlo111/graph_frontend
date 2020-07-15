import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import memoizeOne from 'memoize-one';
import Chart from '../../Chart';
import { toggleNodeModal } from '../../store/actions/app';
import ContextMenu from '../ContextMenu';

class ReactChart extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
  }

  renderChart = memoizeOne((nodes, links) => {
    Chart.render({ nodes, links });
  });

  componentDidMount() {
    Chart.render({ nodes: [], links: [] });

    Chart.event.on('node.click', this.deleteNode);
    ContextMenu.event.on('node.delete', this.deleteNode);

    Chart.event.on('link.click', this.deleteLink);
    ContextMenu.event.on('link.delete', this.deleteLink);

    Chart.event.on('click', this.addNewItem);
    // Chart.event.on('node.mouseenter', this.filterNode);
    // Chart.event.on('node.mouseleave', this.cancelFilterNode);
  }

  componentWillUnmount() {
    Chart.unmount();
  }

  filterNode = (d) => {
    const links = Chart.getNodeLinksNested(d.name);
    Chart.nodes.selectAll('g')
      .style('opacity', (n) => (links.some((link) => link.target === n.name) || d.name === n.name ? 1 : 0.5));

    Chart.links.selectAll('line')
      .style('opacity', (l) => links.some((link) => link.target === l.target || link.source === l.source) ? 1 : 0.5)
  }

  cancelFilterNode = () => {
    Chart.nodes.selectAll('g').attr('style', undefined);
    Chart.links.selectAll('line').attr('style', undefined);
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


  render() {
    const { activeButton, singleGraph: { nodes, links } } = this.props;
    this.renderChart(nodes, links);
    return (
      <div id="graph" data-active={activeButton} className={activeButton} />
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraph: state.graphs.singleGraph,
});
const mapDespatchToProps = {
  toggleNodeModal,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(ReactChart);

export default Container;
