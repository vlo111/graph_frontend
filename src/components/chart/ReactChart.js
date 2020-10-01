import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import Chart from '../../Chart';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import { updateSingleGraph } from '../../store/actions/graphs';
import ContextMenu from '../ContextMenu';
import CustomFields from '../../helpers/CustomFields';
import SocketContext from '../../context/Socket';
import ChartUtils from "../../helpers/ChartUtils";

class ReactChartComp extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
    updateSingleGraph: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    socket: PropTypes.object.isRequired,
  };

  renderChart = memoizeOne((nodes, links, labels) => {
    Chart.render({ nodes, links, labels });
  });

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

    this.props.socket.on('graphUpdate', (data) => {
      data.id = +data.id;
      return (data.id === this.props.singleGraph.id)
        && this.props.updateSingleGraph(data);
    });
  }

  componentWillUnmount() {
    Chart.unmount();
    ContextMenu.event.removeListener('link.delete', this.deleteLink);
    ContextMenu.event.removeListener('node.delete', this.handleNodeClick);
    ContextMenu.event.removeListener('node.edit', this.editNode);
    ContextMenu.event.removeListener('label.delete', this.handleLabelDelete);

    this.props.socket.disconnect();
  }

  handleLabelClick = (ev, d) => {
    if (Chart.activeButton === 'delete') {
      this.handleLabelDelete(ev, d);
    }
  }

  handleLabelCrate = (ev, d) => {
    console.log(d);
  }

  handleLabelDelete = (ev, d) => {
    const labels = Chart.getLabels().filter((l) => l.name !== d.name);
    Chart.render({ labels });
  }

  handleDbNodeClick = (ev, d) => {
    const queryObj = queryString.parse(window.location.search);
    queryObj.info = d.name;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  editNode = (ev, d) => {
    const { customFields } = this.props;
    const customField = CustomFields.get(customFields, d.type, d.name);
    this.props.toggleNodeModal({ ...d, customField });
  }

  addNewNode = (ev) => {
    const { target } = ev;
    if (!['svg', 'path'].includes(target.tagName)
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
    const links = Chart.getLinks();
    links.splice(d.index, 1);
    Chart.render({ links });
  }

  handleNodeClick = (ev, d) => {
    if (Chart.activeButton === 'delete') {
      this.deleteNode(d);
    }
  }

  deleteNode = (ev, d) => {
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
    const { activeButton, singleGraph: { nodes, links, labels } } = this.props;
    this.renderChart(nodes, links, labels);
    return (
      <div id="graph" data-active={activeButton} className={activeButton}>
        <div className="borderCircle">
          {_.range(0, 6).map((k) => <div key={k} />)}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg">
          <g className="wrapper" transform-origin="top left">
            <g className="labels">
              <rect className="labelsBoard" fill="transparent" width="100%" height="100%" />
            </g>
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

const ReactChart = (props) => (
  <SocketContext.Consumer>
    {(socket) => <ReactChartComp {...props} socket={socket} />}
  </SocketContext.Consumer>
);

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraph: state.graphs.singleGraph,
  customFields: state.graphs.singleGraph.customFields || {},
});
const mapDispatchToProps = {
  toggleNodeModal,
  setActiveButton,
  updateSingleGraph,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReactChart);

export default withRouter(Container);
