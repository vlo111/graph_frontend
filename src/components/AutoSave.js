import { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Chart from '../Chart';
import { updateGraphThumbnailRequest } from '../store/actions/graphs';
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
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,

    createNodesRequest: PropTypes.func.isRequired,
    deleteNodesRequest: PropTypes.func.isRequired,
    updateNodesPositionRequest: PropTypes.func.isRequired,
    updateNodesRequest: PropTypes.func.isRequired,

    createLinksRequest: PropTypes.func.isRequired,
    deleteLinksRequest: PropTypes.func.isRequired,
    updateLinksRequest: PropTypes.func.isRequired,

    createLabelsRequest: PropTypes.func.isRequired,
    deleteLabelsRequest: PropTypes.func.isRequired,
    updateLabelsRequest: PropTypes.func.isRequired,

    updateNodesCustomFieldsRequest: PropTypes.func.isRequired,

    updateGraphThumbnailRequest: PropTypes.func.isRequired,
  }

  componentDidMount() {
    Chart.event.on('render', this.handleChartRender);
    Chart.event.on('node.dragend', this.handleChartRender);
    Chart.event.on('label.dragend', this.handleChartRender);
    Chart.event.on('setNodeData', this.handleChartRender);
    Chart.event.on('square.dragend', this.handleChartRender);
    Chart.event.on('selected.dragend', this.handleChartRender);

    this.thumbnailListener = this.props.history.listen(this.handleRouteChange);
    window.addEventListener('beforeunload', this.handleUnload);
    this.thumbnailTimeout = setTimeout(this.updateThumbnail, 1000 * 60);
  }

  componentWillUnmount() {
    clearTimeout(this.thumbnailTimeout);
    this.thumbnailListener();
    window.removeEventListener('beforeunload', this.handleUnload);
  }

  handleChartRender = (ev) => {
    console.log(ev)
    clearTimeout(this.timeout);
    if (ev === Chart && Chart.ignoreAutoSave) {
      return;
    }
    if (!Chart.autoSave) {
      return;
    }
    // this.saveGraph();
    this.timeout = setTimeout(this.saveGraph, 0);
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
    status: node.status || 'approved',
    type: node.type || '',
  })

  formatLink = (d) => ({
    id: d.id || '',
    sx: d.linkType === 'a1' ? d.sx : '',
    sy: d.linkType === 'a1' ? d.sy : '',
    tx: d.linkType === 'a1' ? d.tx : '',
    ty: d.linkType === 'a1' ? d.ty : '',
    source: d.source,
    target: d.target,
    value: +d.value || 1,
    linkType: d.linkType || '',
    type: d.type || '',
    direction: d.direction || '',
    hidden: d.hidden,
    color: d.color || '',
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    createdUser: d.createdUser,
    updatedUser: d.updatedUser,
    readOnly: d.readOnly,
    status: d.status || 'approved',
    fake: d.fake,
  })

  handleSquareDragEnd = (ev, d) => {
    const nodes = Chart.getNodes().filter((n) => d.nodes.includes(n.id) || d.selectedNodes.includes(n.id));
    console.log(nodes);
  }

  saveGraph = async () => {
    const { match: { params: { graphId } } } = this.props;
    if (!graphId) {
      return;
    }
    document.body.classList.add('autoSave');
    const links = Chart.getLinks().filter((d) => !d.fake);
    const labels = Chart.getLabels();
    const nodes = Chart.getNodes().filter((d) => !d.fake);

    const oldNodes = Chart.oldData.nodes.filter((d) => !d.fake);
    const oldLinks = Chart.oldData.links.filter((d) => !d.fake);
    const oldLabels = Chart.oldData.labels.filter((d) => !d.fake);

    const deleteLabels = _.differenceBy(oldLabels, labels, 'id');
    const createLabels = _.differenceBy(labels, oldLabels, 'id');
    const updateLabels = [];
    labels.forEach((label) => {
      const oldLabel = oldLabels.find((l) => l.id === label.id);
      if (oldLabel) {
        if (oldLabel.new) {
          createLabels.push(label);
        } else if (!oldLabel.name && label.name) {
          createLabels.push(label);
        } else if (!_.isEqual(oldLabel.d, label.d)) {
          updateLabels.push(label);
        }
      }
    });

    const deleteNodes = _.differenceBy(oldNodes, nodes, 'id');
    const createNodes = _.differenceBy(nodes, oldNodes, 'id');
    const updateNodes = [];
    const updateNodePositions = [];
    const updateNodeCustomFields = [];
    nodes.forEach((node) => {
      const oldNode = oldNodes.find((n) => n.id === node.id);
      if (oldNode) {
        if (node.import || oldNode.create || !('index' in oldNode)) {
          // if (oldNode.create) {
          createNodes.push(node);
        } else if (oldNode.fx !== node.fx || oldNode.fy !== node.fy) {
          updateNodePositions.push({
            id: node.id,
            fx: node.fx,
            fy: node.fy,
            labels: node.labels,
          });
        } else if (!_.isEqual(this.formatNode(node), this.formatNode(oldNode))) {
          updateNodes.push(node);
        } else if (createLabels.length && createLabels.some((l) => node.labels.includes(l.id))) {
          updateNodePositions.push({
            id: node.id,
            fx: node.fx,
            fy: node.fy,
            labels: node.labels,
          });
        }
        // if ((oldNode.customFields && !_.isEqual(node.customFields, oldNode.customFields))) {
        //   updateNodeCustomFields.push(node);
        // }
      }
    });
    const deleteLinks = _.differenceBy(oldLinks, links, 'id');
    const createLinks = _.differenceBy(links, oldLinks, 'id');
    const updateLinks = [];
    createLinks.push(...oldLinks.filter((l) => l.create));
    links.forEach((link) => {
      const oldLink = oldLinks.find((l) => l.id === link.id);
      if (oldLink) {
        if (!_.isEqual(this.formatLink(oldLink), this.formatLink(link)) && !link.create) {
          updateLinks.push(link);
        }
      }
    });

    if (deleteNodes.length && deleteNodes.length === nodes.length) {
      document.body.classList.remove('autoSave');
      return;
    }

    if (createNodes.length) {
      console.log(createNodes, this.props.createNodesRequest, 444)
      await this.props.createNodesRequest(graphId, createNodes);
    }
    const promise = [];
    if (updateNodes.length) {
      promise.push(this.props.updateNodesRequest(graphId, updateNodes));
    }
    if (deleteNodes.length) {
      promise.push(this.props.deleteNodesRequest(graphId, deleteNodes));
    }
    if (updateNodePositions.length) {
      promise.push(this.props.updateNodesPositionRequest(graphId, updateNodePositions));
    }

    if (updateNodeCustomFields.length) {
      promise.push(this.props.updateNodesCustomFieldsRequest(graphId, updateNodeCustomFields));
    }

    if (createLinks.length) {
      promise.push(this.props.createLinksRequest(graphId, createLinks));
    }
    if (updateLinks.length) {
      promise.push(this.props.updateLinksRequest(graphId, updateLinks));
    }
    if (deleteLinks.length) {
      promise.push(this.props.deleteLinksRequest(graphId, deleteLinks));
    }

    if (createLabels.length) {
      promise.push(this.props.createLabelsRequest(graphId, createLabels));
    }
    if (updateLabels.length) {
      promise.push(this.props.updateLabelsRequest(graphId, updateLabels));
    }
    if (deleteLabels.length) {
      promise.push(this.props.deleteLabelsRequest(graphId, deleteLabels));
    }
    Chart.event.emit('auto-save');

    const res = await Promise.all(promise);
    // res.forEach((d) => {
    //   if (d.payload.data.status !== 'ok') {
    //     toast.error('Graph save error');
    //   }
    // });
    document.body.classList.remove('autoSave');
  }

  handleUnload = (ev) => {
    ev.preventDefault();
    this.updateThumbnail();
    ev.returnValue = 'Changes you made may not be saved.';
  }

  handleRouteChange = (newLocation) => {
    const { location } = this.props;
    if (location.pathname !== newLocation.pathname) {
      this.updateThumbnail();
    }
  }

  updateThumbnail = async () => {
    document.body.classList.add('autoSave');
    const svg = ChartUtils.getChartSvg();
    const { match: { params: { graphId } } } = this.props;
    await this.props.updateGraphThumbnailRequest(graphId, svg, 'small');
    document.body.classList.remove('autoSave');
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
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
