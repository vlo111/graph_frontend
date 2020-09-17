import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import memoizeOne from 'memoize-one';
import Chart from '../../Chart';
import { setActiveButton, toggleNodeFullInfo, toggleNodeModal } from '../../store/actions/app';
import ContextMenu from '../ContextMenu';
import ChartUtils from "../../helpers/ChartUtils";
import CustomFields from "../../helpers/CustomFields";

class ReactChart extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    setActiveButton: PropTypes.func.isRequired,
  }

  renderChart = memoizeOne((nodes, links) => {
    Chart.render({ nodes, links });
  });

  renderChartCustomFields = memoizeOne((customFields) => {
    Chart.render({ customFields });
  });

  componentDidMount() {
    Chart.render({ nodes: [], links: [] });

    Chart.event.on('node.click', this.handleNodeClick);
    Chart.event.on('node.dblclick', this.handleDbNodeClick);

    ContextMenu.event.on('node.delete', this.deleteNode);
    ContextMenu.event.on('node.edit', this.editNode);

    ContextMenu.event.on('active-button', this.setActiveButton);

    Chart.event.on('link.click', this.deleteLink);
    ContextMenu.event.on('link.delete', this.deleteLink);
    Chart.event.on('click', this.addNewNode);
  }

  componentWillUnmount() {
    Chart.unmount();
    ContextMenu.event.removeListener('link.delete', this.deleteLink);
    ContextMenu.event.removeListener('node.delete', this.handleNodeClick);
    ContextMenu.event.removeListener('node.edit', this.editNode);
  }

  handleDbNodeClick = (d) => {
    this.props.toggleNodeFullInfo(d.name);
  }

  editNode = (node) => {
    const { customFields } = this.props;
    const customField = CustomFields.get(customFields, node.type, node.name);
    this.props.toggleNodeModal({ ...node, customField });
  }

  addNewNode = () => {
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

  handleNodeClick = (d) => {
    if (Chart.activeButton === 'delete') {
      this.deleteNode(d);
    }
  }

  deleteNode = (d) => {
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();

    nodes = nodes.filter((n) => n.index !== d.index);

    links = links.filter((l) => !(l.source === d.name || l.target === d.name));

    Chart.render({ nodes, links });
  }

  setActiveButton = (params) => {
    this.props.setActiveButton(params.button);
  }

  render() {
    const { activeButton, singleGraph: { nodes, links, customFields } } = this.props;
    this.renderChart(nodes, links);
    this.renderChartCustomFields(customFields);
    return (
      <div id="graph" data-active={activeButton} className={activeButton}>
        <div className="borderCircle">
          {_.range(0, 6).map((k) => <div key={k} />)}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg">
          <g className="wrapper" transform-origin="top left">
            <g className="directions" />
            <g className="links" />
            <g className="linkText" />
            <g className="nodes" />
            <g className="icons" />
          </g>
        </svg>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraph: state.graphs.singleGraph,
  customFields: state.graphs.singleGraph.customFields || {},
});
const mapDispatchToProps = {
  toggleNodeModal,
  setActiveButton,
  toggleNodeFullInfo,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReactChart);

export default Container;
