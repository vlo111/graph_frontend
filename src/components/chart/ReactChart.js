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

class ReactChart extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  };

  renderChart = memoizeOne((singleGraph, embedLabels) => {
    const { nodes, links, labels } = singleGraph;
    if (!nodes) {
      return;
    }
    console.log(links, ChartUtils.cleanLinks(links, nodes))
    Chart.render({
      nodes, links: ChartUtils.cleanLinks(links, nodes), labels, embedLabels,
    });
  }, _.isEqual);

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
      const nodes = Chart.getNodes().filter((n) => !n.labels.includes(d.name));
      const links = ChartUtils.cleanLinks(Chart.getLinks(), nodes);
      const embedLabels = Chart.data.embedLabels.filter((l) => l.labelName !== d.originalName);
      Chart.render({
        labels, nodes, links, embedLabels,
      });
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
    if (!target.classList.contains('nodeCrate')
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
    const { activeButton, singleGraph, embedLabels } = this.props;
    this.renderChart(singleGraph, embedLabels);
    return (
      <div id="graph" data-active={activeButton} className={activeButton}>
        <div className="borderCircle">
          {_.range(0, 6).map((k) => <div key={k} />)}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="nodeCrate">
          <g className="wrapper" transform-origin="top left">
            <g className="labels">
              <rect className="labelsBoard" fill="transparent" width="100%" height="100%" />
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
  singleGraph: state.graphs.singleGraph,
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
