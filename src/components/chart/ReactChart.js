import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import lockSvg from '../../assets/images/icons/lock.svg';
import Chart from '../../Chart';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import ContextMenu from '../contextMenu/ContextMenu';
import CustomFields from '../../helpers/CustomFields';
import ChartUtils from '../../helpers/ChartUtils';
import { socketLabelDataChange } from '../../store/actions/socket';
import Api from '../../Api';
import { removeNodeFromCustom } from '../../store/actions/graphs';
import FolderResizeIcon from './icons/FolderResizeIcon';
import FolderCloseIcon from './icons/FolderCloseIcon';
import FolderIcon from './icons/FolderIcon';
import LabelLock from './icons/LabelLock';
import SelectedNodeFilter from './icons/SelectedNodeFilter';
import ResizeIcons from './icons/ResizeIcons';
import NotFound from './NotFound';
import { deleteNodeRequest } from '../../store/actions/nodes';
import { deleteLinkRequest } from '../../store/actions/links';

class ReactChart extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
    customFields: PropTypes.object.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      ctrlPress: undefined,
      shiftKey: undefined,
    };
  }

  componentDidMount() {
    Chart.render({ nodes: [], links: [], labels: [] });

    Chart.event.on('node.click', this.handleNodeClick);
    Chart.event.on('node.dblclick', this.handleDbNodeClick);
    Chart.event.on('node.edit', this.editNode);

    ContextMenu.event.on('node.delete', this.deleteNode);
    ContextMenu.event.on('node.edit', this.editNode);

    ContextMenu.event.on('active-button', this.setActiveButton);
    // Chart.event.on('click', this.handleChartClick);
    ContextMenu.event.on('node.create', this.addNewNode);

    Chart.event.on('link.click', this.deleteLink);
    ContextMenu.event.on('link.delete', this.deleteLink);

    ContextMenu.event.on('label.delete', this.handleLabelDelete);
    Chart.event.on('label.click', this.handleLabelClick);

    Chart.event.on('node.dragend', this.handleNodeDragEnd);
    Chart.event.on('render', this.handleRender);
  }

  componentWillUnmount() {
    Chart.unmount();
    ContextMenu.event.removeListener('node.delete', this.deleteNode);
    ContextMenu.event.removeListener('node.edit', this.editNode);
    ContextMenu.event.removeListener('active-button', this.setActiveButton);
    ContextMenu.event.removeListener('link.delete', this.deleteLink);
    ContextMenu.event.removeListener('label.delete', this.handleLabelDelete);
    ContextMenu.event.removeListener('node.create', this.addNewNode);
  }

  handleLabelClick = (ev, d) => {
    if (Chart.activeButton === 'delete') {
      this.handleLabelDelete(ev, d);
    }
  }

  handleLabelCrate = (ev, d) => {
    console.log(d);
  }

  handleRender = () => {
    // clearTimeout(this.renderTimeout);
    // this.renderTimeout = setTimeout(() => {
    //   const { match: { params: { graphId } } } = this.props;
    //   Chart.getLabels().forEach((l) => {
    //     LabelUtils.labelDataChange(graphId, l.id);
    //   });
    // }, 500);
  }

  handleNodeDragEnd = (ev, d) => {
    console.log(d)
    this.handleRender();
  }

  handleLabelDelete = (ev, d) => {
    const labels = Chart.getLabels().filter((l) => l.id !== d.id);
    const nodes = Chart.getNodes().filter((n) => !n.labels || !n.labels.includes(d.id));
    const links = ChartUtils.cleanLinks(Chart.getLinks(), nodes);

    if (d.sourceId) {
      const { match: { params: { graphId } } } = this.props;
      const embedLabels = Chart.data.embedLabels.filter((l) => l.labelId !== d.id);
      Chart.render({
        labels, nodes, links, embedLabels,
      });
      Api.labelDelete(d.sourceId, d.id, graphId);
      return;
    }
    Chart.render({ labels, nodes, links });
    Chart.event.emit('label.mouseleave', ev, d);
  }

  handleDbNodeClick = (ev, d) => {
    const queryObj = queryString.parse(window.location.search);
    queryObj.info = d.id;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  editNode = (ev, d) => {
    if (d.readOnly) {
      return;
    }
    const { customFields } = this.props;
    const customField = CustomFields.get(customFields, d.type, d.id);
    this.props.toggleNodeModal({ ...d, customField });
  }

  handleChartClick = (ev) => {
    const { target } = ev;
    if (!target.classList.contains('nodeCreate')
      || Chart.activeButton !== 'create'
      || Chart.newLink.attr('data-source')) {
      return;
    }
    const { singleGraph } = this.props;
    if (singleGraph.currentUserRole === 'edit_inside' && singleGraph.share.objectId !== target.getAttribute('data-id')) {
      return;
    }
    this.addNewNode(ev);
  }

  addNewNode = (ev) => {
    const { x, y } = ChartUtils.calcScaledPosition(ev.x, ev.y);

    this.props.toggleNodeModal({
      fx: x,
      fy: y,
    });
  }

  deleteLink = (ev, d) => {
    if (Chart.activeButton !== 'delete' && !d.contextMenu) {
      return;
    }
    if (d.readOnly) {
      return;
    }
    const { singleGraph } = this.props;
    const links = Chart.getLinks();
    const link = links.find((l) => l.index === d.index);
    links.splice(d.index, 1);
    this.props.deleteLinkRequest(singleGraph.id, link.id);
    Chart.render({ links });
  }

  handleNodeClick = (ev, d) => {
    if (Chart.activeButton === 'delete') {
      this.deleteNode(ev, d);
    }
  }

  deleteNode = (ev, d) => {
    const { singleGraph } = this.props;
    if (d.readOnly) {
      return;
    }
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();

    nodes = nodes.filter((n) => n.index !== d.index);

    this.props.deleteNodeRequest(singleGraph.id, d.id);

    links = links.filter((l) => {
      if (l.source === d.id || l.target === d.id) {
        // todo delete links
        return false;
      }
      return true;
    });

    this.props.removeNodeFromCustom(d.id);

    Chart.render({ nodes, links });
  }

  setActiveButton = (ev, params) => {
    this.props.setActiveButton(params.button);
  }

  render() {
    const { ctrlPress, shiftKey } = this.state;
    const { activeButton, singleGraphStatus, singleGraph: { currentUserRole } } = this.props;

    // this.renderChart(singleGraph, embedLabels);
    return (
      <div
        id="graph"
        data-role={currentUserRole}
        data-active={activeButton}
        data-shift={shiftKey}
        data-ctrl={ctrlPress}
        className={activeButton}
      >
        <div className="borderCircle">
          {_.range(0, 6).map((k) => <div key={k} />)}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="nodeCreate">
          <g className="wrapper" transform-origin="top left">
            <g className="labels">
              <rect className="labelsBoard areaBoard" fill="transparent" width="100%" height="100%" />
            </g>
            <g className="folders" />
            <g className="directions" />
            <g className="links" />
            <g className="linkText" />
            <g className="nodes" />
            <g className="icons" />
            <g className="folderIcons" />
            <ResizeIcons />
            <defs>
              <filter id="labelShadowFilter" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="1" dy="0" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="0" dy="-1" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="-1" dy="0" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#0d090554" floodOpacity="1" />
              </filter>
              <filter id="grayscaleFilter">
                <feColorMatrix type="saturate" values="0" />
                <feColorMatrix type="luminanceToAlpha" result="A" />
              </filter>
              <SelectedNodeFilter />
              <LabelLock />
              <FolderIcon />
              <FolderCloseIcon />
              <FolderResizeIcon />

            </defs>
          </g>
        </svg>
        {singleGraphStatus === 'fail' ? <NotFound /> : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  embedLabels: state.graphs.embedLabels,
  customFields: state.graphs.singleGraph.customFields || {},
  singleGraph: state.graphs.singleGraph,
  singleGraphStatus: state.graphs.singleGraphStatus,
});
const mapDispatchToProps = {
  toggleNodeModal,
  setActiveButton,
  socketLabelDataChange,
  deleteNodeRequest,
  deleteLinkRequest,
  removeNodeFromCustom,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReactChart);

export default withRouter(Container);
