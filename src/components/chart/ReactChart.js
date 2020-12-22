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
import { removeNodeFromCustom } from "../../store/actions/graphs";

class ReactChart extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
    customFields: PropTypes.object.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
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

    ContextMenu.event.on('node.delete', this.deleteNode);
    ContextMenu.event.on('node.edit', this.editNode);

    ContextMenu.event.on('active-button', this.setActiveButton);
    Chart.event.on('click', this.addNewNode);

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

  addNewNode = (ev) => {
    const { target } = ev;
    if (!target.classList.contains('nodeCreate')
      || Chart.activeButton !== 'create'
      || Chart.newLink.attr('data-source')) {
      return;
    }
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
    const { activeButton } = this.props;

    // this.renderChart(singleGraph, embedLabels);
    return (
      <div id="graph" data-active={activeButton} data-shift={shiftKey} data-ctrl={ctrlPress} className={activeButton}>
        <div className="borderCircle">
          {_.range(0, 6).map((k) => <div key={k} />)}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="nodeCreate">
          <g className="wrapper" transform-origin="top left">
            <g className="labels">
              <rect className="labelsBoard areaBoard" fill="transparent" width="100%" height="100%" />
            </g>
            <g className="directions" />
            <g className="links" />
            <g className="linkText" />
            <g className="nodes" />
            <g className="icons" />
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
                  d="M437.333 192h-32v-42.667C405.333 66.99 338.344 0 256 0S106.667 66.99 106.667 149.333V192h-32A10.66 10.66 0 0064 202.667v266.667C64 492.865 83.135 512 106.667 512h298.667C428.865 512 448 492.865 448 469.333V202.667A10.66 10.66 0 00437.333 192zM287.938 414.823a10.67 10.67 0 01-10.604 11.844h-42.667a10.67 10.67 0 01-10.604-11.844l6.729-60.51c-10.927-7.948-17.458-20.521-17.458-34.313 0-23.531 19.135-42.667 42.667-42.667s42.667 19.135 42.667 42.667c0 13.792-6.531 26.365-17.458 34.313l6.728 60.51zM341.333 192H170.667v-42.667C170.667 102.281 208.948 64 256 64s85.333 38.281 85.333 85.333V192z" />
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
