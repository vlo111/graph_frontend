import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Chart from '../Chart';
import { updateGraphRequest, updateGraphThumbnailRequest } from '../store/actions/graphs';
import ChartUtils from '../helpers/ChartUtils';
import {
  createNodesRequest,
  deleteNodesRequest, updateNodesCustomFieldsRequest,
  updateNodesPositionRequest,
  updateNodesRequest,
} from '../store/actions/nodes';
import { createLinksRequest, deleteLinksRequest, updateLinksRequest } from '../store/actions/links';
import { createLabelsRequest, deleteLabelsRequest, updateLabelsRequest } from '../store/actions/labels';

class AutoSave extends Component {
  static propTypes = {
    updateGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,

    createNodesRequest: PropTypes.func.isRequired,
    deleteNodesRequest: PropTypes.func.isRequired,
    updateNodesPositionRequest: PropTypes.func.isRequired,
    updateNodesCustomFieldsRequest: PropTypes.func.isRequired,
    updateNodesRequest: PropTypes.func.isRequired,

    createLinksRequest: PropTypes.func.isRequired,
    deleteLinksRequest: PropTypes.func.isRequired,
    updateLinksRequest: PropTypes.func.isRequired,

    createLabelsRequest: PropTypes.func.isRequired,
    deleteLabelsRequest: PropTypes.func.isRequired,
    updateLabelsRequest: PropTypes.func.isRequired,

    updateGraphThumbnailRequest: PropTypes.func.isRequired,
  }

  componentDidMount() {
    Chart.event.on('render', this.handleChartRender);
    Chart.event.on('node.dragend', this.handleChartRender);
    Chart.event.on('label.dragend', this.handleChartRender);
    Chart.event.on('setNodeData', this.handleChartRender);
    Chart.event.on('square.dragend', this.handleChartRender);
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

  formatNode = (node) => ({
    id: node.id || '',
    d: node.d || '',
    description: node.description || '',
    icon: node.icon || '',
    infographyId: node.infographyId || '',
    keywords: node.keywords || [],
    // labels: ChartUtils.getNodeLabels(node),
    labels: node.labels || [],
    location: node.location || '',
    name: node.name || '',
    nodeType: node.nodeType || '',
    scale: node.scale || '',
    sourceId: node.sourceId || '',
    status: node.status || '',
    type: node.type || '',
  })

  handleSquareDragEnd = (ev, d) => {
    const nodes = Chart.getNodes().filter((n) => d.nodes.includes(n.id) || d.selectedNodes.includes(n.id));
    console.log(nodes);
  }

  saveGraph = async () => {
    const { match: { params: { graphId } }, singleGraph } = this.props;
    if (!graphId || Chart.ignoreAutoSave) {
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
    const deleteNodes = _.differenceBy(Chart.oldData.nodes, nodes, 'id');
    const createNodes = _.differenceBy(nodes, Chart.oldData.nodes, 'id');

    const updateNodes = [];
    const updateNodePositions = [];
    const updateNodeCustomFields = [];

    nodes.forEach((node) => {
      const oldNode = Chart.oldData.nodes.find((n) => n.id === node.id);
      if (oldNode) {
        if (oldNode.import) {
          createNodes.push(node);
        } else if (oldNode.fx !== node.fx || oldNode.fy !== node.fy) {
          updateNodePositions.push(node);
        } else if (!_.isEqual(this.formatNode(node), this.formatNode(oldNode))) {
          updateNodes.push(node);
        } else if (!_.isEqual(node.customFields, oldNode.customFields)) {
          updateNodeCustomFields.push(node);
        }
      }
    });

    const deleteLinks = _.differenceBy(Chart.oldData.links, links, 'id');
    const createLinks = _.differenceBy(links, Chart.oldData.links, 'id');
    const updateLinks = [];

    links.forEach((link) => {
      const oldLink = Chart.oldData.labels.find((l) => l.id === link.id);
      if (oldLink) {
        if (!_.isEqual(oldLink, link)) {
          updateLinks.push(link);
        }
      }
    });

    const deleteLabels = _.differenceBy(Chart.oldData.labels, labels, 'id');
    const createLabels = _.differenceBy(labels, Chart.oldData.labels, 'id');
    const updateLabels = [];

    labels.forEach((label) => {
      const oldLabel = Chart.oldData.labels.find((l) => l.id === label.id);
      if (oldLabel) {
        if (!oldLabel.name && label.name) {
          createLabels.push(label);
        } else if (!_.isEqual(oldLabel.d, label.d)) {
          updateLabels.push(label);
        }
      }
    });

    let update = false;
    if (createNodes.length) {
      update = true;
      await this.props.createNodesRequest(graphId, createNodes);
    }
    if (updateNodes.length) {
      update = true;
      this.props.updateNodesRequest(graphId, updateNodes);
    }
    if (deleteNodes.length) {
      update = true;
      this.props.deleteNodesRequest(graphId, deleteNodes);
    }
    if (updateNodePositions.length) {
      update = true;
      this.props.updateNodesPositionRequest(graphId, updateNodePositions);
    }

    if (updateNodeCustomFields.length) {
      update = true;
      this.props.updateNodesCustomFieldsRequest(graphId, updateNodeCustomFields);
    }

    if (createLinks.length) {
      update = true;
      this.props.createLinksRequest(graphId, createLinks);
    }
    if (updateLinks.length) {
      update = true;
      this.props.updateLinksRequest(graphId, updateLinks);
    }
    if (deleteLinks.length) {
      update = true;
      this.props.deleteLinksRequest(graphId, deleteLinks);
    }

    if (createLabels.length) {
      update = true;
      this.props.createLabelsRequest(graphId, createLabels);
    }
    if (updateLabels.length) {
      update = true;
      this.props.updateLabelsRequest(graphId, updateLabels);
    }
    if (deleteLabels.length) {
      update = true;
      this.props.deleteLabelsRequest(graphId, deleteLabels);
    }
    if (update) {
      this.props.updateGraphThumbnailRequest(graphId, svg, 'small');
    }

    document.body.classList.remove('autoSave');

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
});

const mapDispatchToProps = {
  updateGraphRequest,

  updateGraphThumbnailRequest,

  updateNodesRequest,
  createNodesRequest,
  deleteNodesRequest,
  updateNodesPositionRequest,
  updateNodesCustomFieldsRequest,

  createLinksRequest,
  updateLinksRequest,
  deleteLinksRequest,

  createLabelsRequest,
  updateLabelsRequest,
  deleteLabelsRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AutoSave);

export default withRouter(Container);
