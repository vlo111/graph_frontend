import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Chart from '../Chart';
import { updateGraphRequest } from '../store/actions/graphs';
import ChartUtils from '../helpers/ChartUtils';

class AutoSave extends Component {
  static propTypes = {
    updateGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
  }

  componentDidMount() {
    Chart.event.on('render', this.handleChartRender);
    Chart.event.on('node.dragend', this.handleChartRender);
    Chart.event.on('label.dragend', this.handleChartRender);
    Chart.event.on('setNodeData', this.handleChartRender);
  }

  componentWillUnmount() {
    Chart.event.removeListener('node.dragend', this.handleChartRender);
  }

  handleChartRender = () => {
    clearTimeout(this.timeout);
    if (!Chart.autoSave) {
      return;
    }
    this.timeout = setTimeout(this.saveGraph, 50);
  }

  formatNode = (node) => {
    return {
      id: node.id || '',
      color: node.color || '',
      d: node.d || '',
      description: node.description || '',
      icon: node.icon || '',
      infographyId: node.infographyId || '',
      keywords: node.keywords || [],
      labels: node.labels || [],
      location: node.location || '',
      name: node.name || '',
      nodeType: node.nodeType || '',
      scale: node.scale || '',
      sourceId: node.sourceId || '',
      status: node.status || '',
      type: node.type || '',
    }
  }

  saveGraph = async () => {
    const { match: { params: { graphId } }, singleGraph } = this.props;
    if (!graphId) {
      return;
    }
    document.body.classList.add('autoSave');
    const links = Chart.getLinks();
    const labels = Chart.getLabels();
    const nodes = Chart.getNodes();
    // const {
    //   nodes, files, customFields,
    // } = await ChartUtils.getNodesWithFiles(this.props.customFields, singleGraph.documents);

    const svg = ChartUtils.getChartSvg();
    const deleteNodes = _.differenceBy(Chart.oldData.nodes, Chart.getNodes(), 'id');
    const createNodes = _.differenceBy(Chart.getNodes(), Chart.oldData.nodes, 'id');

    const updateNodes = [];
    const updateNodePositions = [];

    nodes.forEach((node) => {
      const oldNode = Chart.oldData.nodes.find((n) => n.id === node.id);
      if (oldNode) {
        if (!_.isEqual(this.formatNode(node), this.formatNode(oldNode))) {
          console.log(this.formatNode(node), this.formatNode(oldNode))
          updateNodes.push(node);
        } else if (oldNode.fx !== node.fx || oldNode.fy !== node.fy) {
          updateNodePositions.push(node);
        }
      }
    });

    console.log({
      deleteNodes, createNodes, updateNodes, updateNodePositions,
    });
    return;
    await this.props.updateGraphRequest(graphId, {
      ...singleGraph,
      nodes,
      links,
      labels,
      files,
      customFields,
      autoSave: true,
      svg,
    });
    singleGraph.dismissFiles = null;
    singleGraph.documents = null;
    document.body.classList.remove('autoSave');
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  updateGraphRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AutoSave);

export default withRouter(Container);
