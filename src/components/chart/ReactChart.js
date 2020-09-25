import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import memoizeOne from 'memoize-one';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import Chart from '../../Chart';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import { updateSingleGraph } from '../../store/actions/graphs';
import ContextMenu from '../ContextMenu';
import CustomFields from '../../helpers/CustomFields';
import SocketContext from '../../context/Socket';

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

  renderChart = memoizeOne((nodes, links) => {
    Chart.render({ nodes, links });
  });

  componentDidMount() {
    Chart.render({ nodes: [], links: [] });

    Chart.event.on('node.click', this.handleNodeClick);
    Chart.event.on('node.dblclick', this.handleDbNodeClick);

    ContextMenu.event.on('node.delete', this.deleteNode);
    ContextMenu.event.on('node.edit', this.editNode);

    ContextMenu.event.on('active-button', this.setActiveButton);

    Chart.event.on('link.click', this.deleteLink);
    ContextMenu.event.on('link.delete', this.deleteLink);
    Chart.event.on('click', this.addNewNode);

    this.props.socket.on('graphUpdate', (data) => {
      this.props.updateSingleGraph(data);
    });
  }

  componentWillUnmount() {
    Chart.unmount();
    ContextMenu.event.removeListener('link.delete', this.deleteLink);
    ContextMenu.event.removeListener('node.delete', this.handleNodeClick);
    ContextMenu.event.removeListener('node.edit', this.editNode);
    this.props.socket.disconnect();
  }

  handleDbNodeClick = (d) => {
    const queryObj = queryString.parse(window.location.search);
    queryObj.info = d.name;
    const query = queryString.stringify(queryObj);
    this.props.history.replace(`?${query}`);
  }

  editNode = (node) => {
    const { customFields } = this.props;
    const customField = CustomFields.get(customFields, node.type, node.name);
    this.props.toggleNodeModal({ ...node, customField });
  }

  addNewNode = () => {
    const { target } = d3.event;
    if (target.tagName !== 'svg'
      || Chart.activeButton !== 'create'
      || Chart.newLink.attr('data-source')) {
      return;
    }
    const { x, y } = Chart.getScaledPosition();

    this.props.toggleNodeModal({
      fx: x,
      fy: y,
    });
  }

  deleteLink = (d) => {
    if (Chart.activeButton !== 'delete' && !d.contextMenu) {
      return;
    }
    const links = Chart.getLinks();
    links.splice(d.index, 1);
    Chart.render({ links });
  }

  handleNodeClick = (d) => {
    if (Chart.activeButton === 'delete') {
      this.deleteNode(d);
    }
  }

  deleteNode = (d) => {
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
    const { activeButton, singleGraph: { nodes, links } } = this.props;
    this.renderChart(nodes, links);
    return (
      <div id="graph" data-active={activeButton} className={activeButton}>
        <div className="borderCircle">
          {_.range(0, 6).map((k) => <div key={k} />)}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg">
          <g className="wrapper" transform-origin="top left">
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
