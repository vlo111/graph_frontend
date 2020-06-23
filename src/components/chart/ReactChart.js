import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import Chart from '../../Chart';
import { showNodeDescription, toggleNodeModal } from '../../store/actions/app';
import ContextMenu from '../ContextMenu';

class ReactChart extends Component {
  static propTypes = {
    activeButton: PropTypes.string.isRequired,
    showNodeDescription: PropTypes.func.isRequired,
    nodeDescription: PropTypes.string.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
  }

  async componentDidMount() {
    const data = { nodes: [], links: [] };
    data.nodes.push({
      name: 'Instagram',
      value: 5,
      type: '2',
      fx: 250,
      fy: 250,
      links: '[link url="https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture"]asdasdasd[/link] [link url="https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture"]asdasdada213131313[/link]',
      description: 'Asdasd asdasdsad asd asd as dasdsa da s',
      files: '[file url="blob:http://localhost:3000/bc48f756-96ae-4f92-9914-21a8362253e7"]asdasdasdasd[/file]',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/1024px-Instagram_logo_2016.svg.png',
    });

    data.nodes.push({
      name: 'Hell',
      value: 5,
      type: '2',
      fx: 500,
      fy: 250,
    });

    Chart.render(data);

    Chart.event.on('node.click', this.deleteNode);
    ContextMenu.event.on('node.delete', this.deleteNode);

    Chart.event.on('node.mouseenter', this.showNodeInfo);
    Chart.event.on('node.mouseleave', this.cancelNodeInfo);
    document.addEventListener('mousedown', this.hideInfo, true);


    Chart.event.on('link.click', this.deleteLink);
    ContextMenu.event.on('link.delete', this.deleteLink);

    Chart.event.on('click', this.addNewItem);

    Chart.event.on('line.new', this.handleAddNewLine);
  }

  componentWillUnmount() {
    Chart.unmount();
    document.removeEventListener('mousedown', this.hideInfo, true);
  }

  showNodeInfo = async (d) => {
    clearTimeout(this.showInfoTimout);
    this.showInfoTimout = setTimeout(() => {
      this.props.showNodeDescription(d.name);
    }, 800);
  }

  hideInfo = async () => {
    const { nodeDescription } = this.props;
    clearTimeout(this.showInfoTimout);
    if (nodeDescription) {
      this.props.showNodeDescription();
    }
  }

  cancelNodeInfo = () => {
    clearTimeout(this.showInfoTimout);
  }


  addNewItem = () => {
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


  deleteNode = (d) => {
    if (Chart.activeButton !== 'delete' && !d.contextMenu) {
      return;
    }
    const nodes = Chart.getNodes();
    let links = Chart.getLinks();

    nodes.splice(d.index, 1);

    links = links.filter((l) => l.source !== d.name && l.target !== d.name);

    Chart.render({ links, nodes });
  }

  handleAddNewLine = (d) => {
    const { source, target } = d;
    const links = Chart.getLinks();
    links.push({
      source,
      target,
      value: 2,
    });
    Chart.render({ links });
  }

  render() {
    const { activeButton } = this.props;
    return (
      <div id="graph" data-active={activeButton} className={activeButton} />
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  nodeDescription: state.app.nodeDescription,
});
const mapDespatchToProps = {
  showNodeDescription,
  toggleNodeModal,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(ReactChart);

export default Container;
