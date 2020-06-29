import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { setActiveButton, setGridIndexes } from '../../store/actions/app';
import Chart from '../../Chart';
import Button from '../form/Button';
import HeaderPortal from '../form/HeaderPortal';
import DataTableNodes from './DataTableNodes';
import DataTableLinks from './DataTableLinks';
import Api from '../../Api';

class DataView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
    selectedGrid: PropTypes.objectOf(PropTypes.array).isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      fullWidth: false,
      activeTab: 'nodes',
    };
  }

  componentDidMount() {
    this.checkAllGrids();
    Chart.svgSize();
  }

  componentWillUnmount() {
    this.unCheckAllGrids();
    setTimeout(() => {
      Chart.svgSize();
    }, 100);
  }

  unCheckAllGrids = () => {
    this.props.setGridIndexes('nodes', []);
    this.props.setGridIndexes('links', []);
  }

  checkAllGrids = () => {
    const { selectedGrid } = this.props;
    if (_.isEmpty(selectedGrid.nodes)) {
      const nodes = Chart.getNodes();
      this.props.setGridIndexes('nodes', _.range(nodes.length));
    }
    if (_.isEmpty(selectedGrid.links)) {
      const links = Chart.getLinks();
      this.props.setGridIndexes('links', _.range(links.length));
    }
  }

  toggleFullWidth = () => {
    const { fullWidth } = this.state;
    this.setState({ fullWidth: !fullWidth });
  }

  close = () => {
    this.props.setActiveButton('create');
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab });
  }

  export = (type) => {
    const nodes = Chart.getNodes();
    const links = Chart.getLinks();
    if (type === 'csv') {
      Api.download('csv-nodes', { nodes });
      if (!_.isEmpty(links)) {
        Api.download('csv-links', { links });
      }
      return;
    }
    Api.download(type, { nodes, links });
  }

  exportPng = async () => {
    const svg = document.querySelector('#graph svg').outerHTML;
    Api.download('png', { svg });
  }

  render() {
    const { fullWidth, activeTab } = this.state;
    const links = Chart.getLinks();
    const nodes = Chart.getNodes();

    return (
      <div id="dataTable">
        <HeaderPortal>
          <div className="exportButtons">
            <Button onClick={() => this.export('csv')}>Export csv</Button>
            <Button onClick={() => this.export('csv-zip')}>Export zip</Button>
            <Button onClick={() => this.export('xlsx')}>Export xlsx</Button>
            <Button onClick={() => this.exportPng()}>Export png</Button>
          </div>
        </HeaderPortal>
        <div className={`contentWrapper ${fullWidth ? 'fullWidth' : ''}`}>
          <div className="header">
            <h3>
              {activeTab === 'links' ? 'Links' : 'Nodes'}
            </h3>
            <div className="buttons">
              <Button icon="fa-expand" onClick={this.toggleFullWidth} />
              <Button icon="fa-times" onClick={this.close} />
            </div>
          </div>
          <div className="ghGridTableWrapper">
            {activeTab === 'links' ? (
              <DataTableLinks />
            ) : (
              <DataTableNodes />
            )}
          </div>
          <div className="tabs">
            <Button className={activeTab === 'nodes' ? 'active' : ''} onClick={() => this.setActiveTab('nodes')}>
              Nodes
              <sub>{`[${nodes.length}]`}</sub>
            </Button>
            {links.length ? (
              <Button className={activeTab === 'links' ? 'active' : ''} onClick={() => this.setActiveTab('links')}>
                Links
                <sub>{`[${links.length}]`}</sub>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  selectedGrid: state.app.selectedGrid,
});
const mapDespatchToProps = {
  setActiveButton,
  setGridIndexes,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(DataView);

export default Container;
