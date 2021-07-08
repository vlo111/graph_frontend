import { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Chart from '../Chart';
import { updateGraphPositionsRequest, updateGraphThumbnailRequest } from '../store/actions/graphs';
import ChartUtils from '../helpers/ChartUtils';
import {
  createNodesRequest,
  deleteNodesRequest, updateNodesCustomFieldsRequest,
  updateNodesPositionRequest,
  updateNodesRequest,
} from '../store/actions/nodes';
import { createLinksRequest, deleteLinksRequest, updateLinksRequest } from '../store/actions/links';
import {
  createLabelsRequest,
  deleteLabelsRequest, toggleFolderRequest,
  updateLabelPositionsRequest,
  updateLabelsRequest,
} from '../store/actions/labels';
import Utils from '../helpers/Utils';

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

    updateGraphPositionsRequest: PropTypes.func.isRequired,

    createLabelsRequest: PropTypes.func.isRequired,
    deleteLabelsRequest: PropTypes.func.isRequired,
    updateLabelsRequest: PropTypes.func.isRequired,
    toggleFolderRequest: PropTypes.func.isRequired,

    updateNodesCustomFieldsRequest: PropTypes.func.isRequired,

    updateGraphThumbnailRequest: PropTypes.func.isRequired,
  }

  async componentDidMount() {
    await Utils.sleep(500);
    Chart.event.on('render', this.handleChartRender);
    Chart.event.on('node.dragend', this.handleChartRender);
    Chart.event.on('label.dragend', this.handleChartRender);
    Chart.event.on('setNodeData', this.handleChartRender);
    Chart.event.on('square.dragend', this.handleChartRender);
    Chart.event.on('link.save', this.handleChartRender);
    Chart.event.on('selected.dragend', this.handleChartRender);
    Chart.event.on('folder.open', this.handleFolderToggle);
    Chart.event.on('folder.close', this.handleFolderToggle);
    Chart.event.on('node.resize-end', this.handleNodeResizeEnd);

    Chart.event.on('auto-position.change', this.handleAutoPositionChange);

    this.thumbnailListener = this.props.history.listen(this.handleRouteChange);
    window.addEventListener('beforeunload', this.handleUnload);
    this.thumbnailTimeout = setTimeout(this.updateThumbnail, 1000 * 60);
  }

  componentWillUnmount() {
    clearTimeout(this.thumbnailTimeout);
    this.thumbnailListener();
    window.removeEventListener('beforeunload', this.handleUnload);
  }

  handleFolderToggle = async (ev, d) => {
    if (ev === Chart && Chart.ignoreAutoSave) {
      return;
    }
    if (!Chart.autoSave) {
      return;
    }
    const { match: { params: { graphId } } } = this.props;
    await this.props.toggleFolderRequest(graphId, {
      id: d.id,
      open: d.open,
    });
  }

  handleChartRender = (ev) => {
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
    update: d.update,
  })

  formatLabel = (d) => ({
    d: d.d || '',
    status: d.status || 'unlock',
    name: d.name || '',
  })

  handleSquareDragEnd = (ev, d) => {
    const nodes = Chart.getNodes().filter((n) => d.nodes.includes(n.id) || d.selectedNodes.includes(n.id));
  }

  handleAutoPositionChange = async (isAutoPosition) => {
    if (isAutoPosition) {
      return;
    }
    const { match: { params: { graphId } } } = this.props;
    const updateNodePositions = Chart.getNodes().filter((d) => !d.fake).map((node) => ({
      id: node.id,
      fx: node.fx,
      fy: node.fy,
      labels: node.labels,
    }));
    document.body.classList.add('autoSave');
    await this.props.updateNodesPositionRequest(graphId, updateNodePositions);
    document.body.classList.remove('autoSave');
  }

  handleNodeResizeEnd = async (ev, d) => {
    const { match: { params: { graphId } } } = this.props;
    document.body.classList.add('autoSave');
    await this.props.updateNodesRequest(graphId, [d]);
    document.body.classList.remove('autoSave');
  }

  saveGraph = async () => {
    const { match: { params: { graphId } } } = this.props;
    if (!graphId || Chart.isAutoPosition) {
      return;
    }
    document.body.classList.add('autoSave');
    const links = Chart.getLinks(true).filter((d) => !d.fake && !d.sourceId);
    const labels = Chart.getLabels();
    const nodes = Chart.getNodes(true).filter((d) => !d.fake && !d.sourceId);

    const oldNodes = Chart.oldData.nodes.filter((d) => !d.fake && !d.sourceId);
    const oldLinks = Chart.oldData.links.filter((d) => !d.fake && !d.sourceId);
    const oldLabels = Chart.oldData.labels.filter((d) => !d.fake);

    let deleteLabels = _.differenceBy(oldLabels, labels, 'id');
    let createLabels = _.differenceBy(labels, oldLabels, 'id');
    let updateLabels = [];
    const updateLabelPositions = [];
    let newLabel = false;
    labels.forEach((label) => {
      const oldLabel = oldLabels.find((l) => l.id === label.id);
      if (oldLabel) {
        if (!_.isEqual(label.d, oldLabel.d)) {
          updateLabelPositions.push({
            id: label.id,
            d: label.d,
            type: label.type,
            open: label.open,
          });
        } else if (!oldLabel.name && label.name) {
          createLabels.push(label);
        } else if (!_.isEqual(this.formatLabel(label), this.formatLabel(oldLabel))) {
          updateLabels.push(label);
        } else if (oldLabel.new || oldLabel.import) {
          newLabel = true;
          createLabels.push(label);
        } else if (!_.isEqual(label.size, oldLabel.size)) {
          updateLabelPositions.push({
            id: label.id,
            d: label.d,
            size: label.size,
            type: label.type,
            open: label.open,
          });
        }
      }
    });

    createLabels = createLabels.filter((d) => !d.sourceId);
    updateLabels = updateLabels.filter((d) => !d.sourceId);
    deleteLabels = deleteLabels.filter((d) => !d.sourceId);

    if (newLabel) {
      Chart.oldData.labels = Chart.oldData.labels.map((d) => {
        delete d.new;
        delete d.import;
        return d;
      });
    }

    const deleteNodes = _.differenceBy(oldNodes, nodes, 'id');
    const createNodes = _.differenceBy(nodes, oldNodes, 'id');
    const updateNodes = [];
    const updateNodePositions = [];
    const updateNodeCustomFields = [];
    nodes.forEach((node) => {
      const oldNode = oldNodes.find((n) => n.id === node.id);
      if (oldNode) {
        if (oldNode.fx !== node.fx || oldNode.fy !== node.fy) {
          updateNodePositions.push({
            id: node.id,
            fx: node.fx,
            fy: node.fy,
            labels: node.labels,
          });
        } else if (node.import || oldNode.create || !('index' in oldNode)) {
          // if (oldNode.create) {
          createNodes.push(node);
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
    let createLinks = _.differenceBy(links, oldLinks, 'id');
    let updateLinks = [];
    createLinks.push(...oldLinks.filter((l) => l.create));
    oldLinks.forEach((l) => {
      delete l.create;
    });
    links.forEach((link) => {
      const oldLink = oldLinks.find((l) => l.id === link.id);
      if (oldLink) {
        if (_.isUndefined(oldLink.index) || _.isUndefined(link.index)) {
          createLinks.push(link);
        } else if (!_.isEqual(this.formatLink(oldLink), this.formatLink(link)) && !link.create) {
          updateLinks.push(link);
        }
      }
    });
    createLinks = ChartUtils.uniqueLinks(createLinks);
    updateLinks = updateLinks.filter((l) => !createLinks.some((link) => link.id === l.id));
    if (deleteNodes.length && deleteNodes.length === nodes.length) {
      // document.body.classList.remove('autoSave');
      // return;
    }
    if (createNodes.length) {
      const { payload: { data = {} } } = await this.props.createNodesRequest(graphId, createNodes);
      if (!_.isEmpty(data.errors)) {
        toast.error('Something went wrong');
      }
    }
    const promise = [];
    if (updateNodes.length) {
      promise.push(this.props.updateNodesRequest(graphId, updateNodes));
    }
    if (deleteNodes.length) {
      promise.push(this.props.deleteNodesRequest(graphId, deleteNodes));
    }
    // if (updateNodePositions.length) {
    //   promise.push(this.props.updateNodesPositionRequest(graphId, updateNodePositions));
    // }

    if (updateNodePositions.length || updateLabelPositions.length) {
      promise.push(this.props.updateGraphPositionsRequest(graphId, updateNodePositions, updateLabelPositions));
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

    // if (updateLabelPositions.length) {
    //   promise.push(this.props.updateLabelPositionsRequest(graphId, updateLabelPositions));
    // }
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
  updateLabelPositionsRequest,
  deleteLinksRequest,

  updateGraphPositionsRequest,

  createLabelsRequest,
  updateLabelsRequest,
  deleteLabelsRequest,
  toggleFolderRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AutoSave);

export default withRouter(Container);
