import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import Chart from '../../Chart';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import ContextMenu from '../contextMenu/ContextMenu';
import CustomFields from '../../helpers/CustomFields';
import ChartUtils from '../../helpers/ChartUtils';
import { socketLabelDataChange } from '../../store/actions/socket';
import LabelUtils from '../../helpers/LabelUtils';
import Utils from '../../helpers/Utils';
import Api from "../../Api";

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
    }
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

    window.addEventListener('keydown', this.handleKeyPress);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    Chart.unmount();
    ContextMenu.event.removeListener('node.delete', this.deleteNode);
    ContextMenu.event.removeListener('node.edit', this.editNode);
    ContextMenu.event.removeListener('active-button', this.setActiveButton);
    ContextMenu.event.removeListener('link.delete', this.deleteLink);
    ContextMenu.event.removeListener('label.delete', this.handleLabelDelete);
  }

  handleKeyPress = (ev) => {
    ChartUtils.keyEvent(ev);
    const { ctrlPress, shiftKey } = this.state;
    if (ctrlPress !== ev.ctrlPress || shiftKey !== ev.shiftKey) {
      this.setState({
        ctrlPress: ev.ctrlPress ? '' : undefined,
        shiftKey: ev.shiftKey ? '' : undefined,
      });
    }
  }

  handleKeyUp = () => {
    this.setState({ ctrlPress: undefined, shiftKey: undefined });
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
    clearTimeout(this.renderTimeout);
    this.renderTimeout = setTimeout(() => {
      const { match: { params: { graphId } } } = this.props;
      Chart.getLabels().forEach((l) => {
        LabelUtils.labelDataChange(graphId, l.name);
      });
    }, 500);
  }

  handleNodeDragEnd = (ev, d) => {
    this.handleRender();
  }

  handleLabelDelete = (ev, d) => {
    const labels = Chart.getLabels().filter((l) => l.name !== d.name);
    if (d.sourceId) {
      const { match: { params: { graphId } } } = this.props;
      const nodes = Chart.getNodes().filter((n) => !n.labels || !n.labels.includes(d.name));
      const links = ChartUtils.cleanLinks(Chart.getLinks(), nodes);
      const embedLabels = Chart.data.embedLabels.filter((l) => l.labelName !== d.originalName);
      Chart.render({
        labels, nodes, links, embedLabels,
      });
      Api.labelDelete(d.sourceId, d.originalName, graphId);
      return;
    }
    Chart.render({ labels });
  }

  handleDbNodeClick = (ev, d) => {
    const queryObj = queryString.parse(window.location.search);
    queryObj.info = d.name;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  editNode = (ev, d) => {
    if (d.readOnly) {
      return;
    }
    const { customFields } = this.props;
    const customField = CustomFields.get(customFields, d.type, d.name);
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

    links = links.filter((l) => !(l.source === d.name || l.target === d.name));

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
        <svg xmlns="http://www.w3.org/2000/svg" className="nodeCreate">
          <g className="wrapper" transform-origin="top left">
            <g className="labels">
              <rect className="labelsBoard areaBoard" fill="transparent" width="100%" height="100%" />
            </g>
            <g className="directions" />
            <g className="links" />
            <g className="linkText" />
            <g className="nodes" />
            <g className="icons" />

            <rect className="selectBoard areaBoard" fill="transparent" width="0" height="0" />

            <defs>
              <filter id="labelShadowFilter" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="1" dy="0" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="0" dy="-1" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
                <feDropShadow dx="-1" dy="0" stdDeviation="0" floodColor="#0D0905" floodOpacity="1" />
              </filter>
              <filter id="grayscaleFilter">
                <feColorMatrix type="saturate" values="0" />
                <feColorMatrix type="luminanceToAlpha" result="A" />
              </filter>
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
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReactChart);

export default withRouter(Container);
