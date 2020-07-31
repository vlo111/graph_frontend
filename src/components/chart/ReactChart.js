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
      <div id="graph" data-active={activeButton} className={activeButton}>
        <svg xmlns="http://www.w3.org/2000/svg">
          <g className="wrapper" transform-origin="top left">
            <g className="directions" />
            <g className="links" />
            <g className="linkText" />
            <g className="nodes" />
            <g className="icons" />
            <defs>
              <path
                id="arrow"
                strokeOpacity="1"
                strokeWidth="0"
                transform-origin="top left"
                d="M 4.980469 2.421875 C 4.964844 2.386719 4.9375 2.359375 4.902344 2.339844 L 0.257812 0.0195312 C 0.171875 -0.0234375 0.0625 0.0117188 0.0195312 0.0976562 C 0.0078125 0.125 0 0.152344 0 0.179688 L 0 4.820312 C 0 4.921875 0.078125 5 0.179688 5 C 0.207031 5 0.234375 4.992188 0.257812 4.980469 L 4.902344 2.660156 C 4.988281 2.617188 5.023438 2.507812 4.980469 2.421875 Z M 4.980469 2.421875"
              />
            </defs>
          </g>
        </svg>
      </div>
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
