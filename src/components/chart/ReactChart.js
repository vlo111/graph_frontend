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
    Chart.event.on('click', this.handleChartClick);
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
    this.handleRender();
  }

  handleLabelDelete = (ev, d) => {
    const labels = Chart.getLabels().filter((l) => l.id !== d.id);
    if (d.sourceId) {
      const { match: { params: { graphId } } } = this.props;
      const nodes = Chart.getNodes().filter((n) => !n.labels || !n.labels.includes(d.id));
      const links = ChartUtils.cleanLinks(Chart.getLinks(), nodes);
      const embedLabels = Chart.data.embedLabels.filter((l) => l.labelId !== d.id);
      Chart.render({
        labels, nodes, links, embedLabels,
      });
      Api.labelDelete(d.sourceId, d.id, graphId);
      return;
    }
    Chart.render({ labels });
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
    const links = Chart.getLinks();
    links.splice(d.index, 1);
    Chart.render({ links });
  }

  handleNodeClick = (ev, d) => {
    if (Chart.activeButton === 'delete') {
      this.deleteNode(ev, d);
    }
  }

  deleteNode = (ev, d) => {
    if (d.readOnly) {
      return;
    }
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();

    nodes = nodes.filter((n) => n.index !== d.index);

    links = links.filter((l) => !(l.source === d.id || l.target === d.id));

    this.props.removeNodeFromCustom(d.id);

    Chart.render({ nodes, links });
  }

  setActiveButton = (ev, params) => {
    this.props.setActiveButton(params.button);
  }

  render() {
    const { ctrlPress, shiftKey } = this.state;
    const { activeButton, singleGraph: { currentUserRole } } = this.props;

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
              <filter id="selectedNodeFilter" x="-50%" y="-50%" width="300%" height="300%">
                <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#7166F8" floodOpacity="1">
                  <animate
                    attributeName="stdDeviation"
                    values="1;4;1"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </feDropShadow>
              </filter>

              <symbol id="labelLock" viewBox="0 0 512 512" width="40" height="40">
                <path
                  opacity="0.6"
                  d="M437.333 192h-32v-42.667C405.333 66.99 338.344 0 256 0S106.667 66.99 106.667
                  149.333V192h-32A10.66 10.66 0 0064 202.667v266.667C64 492.865 83.135 512 106.667
                  512h298.667C428.865 512 448 492.865 448 469.333V202.667A10.66 10.66 0 00437.333
                  192zM287.938 414.823a10.67 10.67 0 01-10.604 11.844h-42.667a10.67 10.67 0
                  01-10.604-11.844l6.729-60.51c-10.927-7.948-17.458-20.521-17.458-34.313 0-23.531 19.135-42.667
                  42.667-42.667s42.667 19.135 42.667 42.667c0 13.792-6.531 26.365-17.458 34.313l6.728
                  60.51zM341.333 192H170.667v-42.667C170.667 102.281 208.948 64 256 64s85.333 38.281 85.333 85.333V192z"
                />
              </symbol>
              <symbol id="folderIcon" viewBox="0 0 468.293 468.293" width="60" height="60">
                <path
                  d="M206.049 72.574V55.559c0-10.345-8.386-18.732-18.732-18.732H18.732C8.386 36.827 0 45.213 0
                  55.559v110.248h468.293v-62.013c0-10.345-8.386-18.732-18.732-18.732H218.537c-6.897
                  0-12.488-5.591-12.488-12.488z"
                  fill="#0047b9"
                />
                <path
                  d="M443.317 431.466H24.976C11.182 431.466 0 420.284 0 406.49V161.35h206.748a18.73 18.73 0
                  0013.842-6.111l23.013-25.241a18.73 18.73 0 0113.842-6.111h210.848V406.49c0 13.794-11.182
                  24.976-24.976 24.976z"
                  fill="#0062FF"
                />
              </symbol>
              <symbol id="folderCloseIcon" viewBox="0 0 512 512" width="30" height="30">
                <circle cx="256" cy="256" r="256" fill="transparent" />
                <path
                  d="M256 0C114.844 0 0 114.844 0 256s114.844 256 256 256 256-114.844 256-256S397.156 0 256
                  0zm103.54 329.374c4.167 4.165 4.167 10.919 0 15.085l-15.08 15.081c-4.167 4.165-10.919
                  4.165-15.086 0L256 286.167l-73.374 73.374c-4.167 4.165-10.919 4.165-15.086
                  0l-15.081-15.082c-4.167-4.165-4.167-10.919
                  0-15.085l73.374-73.375-73.374-73.374c-4.167-4.165-4.167-10.919 0-15.085l15.081-15.082c4.167-4.165
                  10.919-4.165 15.086 0L256 225.832l73.374-73.374c4.167-4.165 10.919-4.165 15.086
                  0l15.081 15.082c4.167 4.165 4.167 10.919 0 15.085l-73.374 73.374 73.373 73.375z"
                />
              </symbol>
              <symbol id="folderResizeIcon" viewBox="0 0 438.529 438.529" width="40" height="40">
                <path
                  d="M212.701 180.157c1.902-1.903 2.854-4.093 2.854-6.567 0-2.475-.951-4.665-2.854-6.567l-94.787-94.787 41.117-41.112c3.61-3.617 5.421-7.895 5.421-12.847s-1.811-9.235-5.421-12.851C155.41 1.809 151.126.002 146.177.002H18.27c-4.948 0-9.229 1.807-12.847 5.424C1.81 9.045-.001 13.328-.001 18.277v127.906c0 4.949 1.811 9.23 5.424 12.847 3.617 3.615 7.898 5.424 12.847 5.424s9.233-1.809 12.854-5.424l41.104-41.112 94.793 94.787c1.903 1.902 4.086 2.853 6.564 2.853 2.478 0 4.66-.953 6.57-2.853l32.546-32.548zM433.105 433.111c3.617-3.614 5.424-7.898 5.424-12.847V292.357c0-4.948-1.807-9.227-5.424-12.847-3.615-3.614-7.898-5.421-12.847-5.421s-9.233 1.807-12.847 5.421l-41.112 41.106-94.787-94.786c-1.906-1.901-4.093-2.854-6.567-2.854s-4.665.953-6.567 2.854l-32.548 32.552c-1.903 1.902-2.853 4.086-2.853 6.563s.95 4.661 2.853 6.563l94.787 94.794-41.109 41.104c-3.616 3.62-5.428 7.905-5.428 12.854s1.812 9.229 5.428 12.847c3.614 3.614 7.898 5.421 12.847 5.421h127.906c4.953.003 9.228-1.793 12.844-5.417z"
                />
              </symbol>

            </defs>
          </g>
        </svg>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  embedLabels: state.graphs.embedLabels,
  customFields: state.graphs.singleGraph.customFields || {},
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {
  toggleNodeModal,
  setActiveButton,
  socketLabelDataChange,
  removeNodeFromCustom,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReactChart);

export default withRouter(Container);
