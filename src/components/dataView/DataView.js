import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { setActiveButton, setGridIndexes, setLoading } from '../../store/actions/app';
import Chart from '../../Chart';
import Button from '../form/Button';
import HeaderPortal from '../HeaderPortal';
import DataTableNodes from './DataTableNodes';
import DataTableLinks from './DataTableLinks';
import Api from '../../Api';

class DataView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
    selectedGrid: PropTypes.objectOf(PropTypes.array).isRequired,
  }

  constructor(props) {
    super(props);
    const nodes = Chart.getNodes();

    this.state = {
      fullWidth: false,
      activeTab: {
        group: 'nodes',
        type: nodes[0]?.type || '',
      },
    };
  }

  componentDidMount() {
    this.checkAllGrids();
    Chart.resizeSvg();
  }

  componentWillUnmount() {
    this.unCheckAllGrids();
    setTimeout(() => {
      Chart.resizeSvg();
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

  setActiveTab = (group, type) => {
    this.setState({
      activeTab: {
        type, group,
      },
    });
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

  download = async (type) => {
    this.props.setLoading(true);
    const reset = Chart.printMode(1900, 1060);
    const svg = document.querySelector('#graph svg').outerHTML;
    reset();
    await Api.download(type, { svg });
    this.props.setLoading(false);
  }

  render() {
    const { fullWidth, activeTab } = this.state;
    const links = Chart.getLinks();
    const nodes = Chart.getNodes();
    const linksGrouped = _.groupBy(links, 'type');
    const nodesGrouped = _.groupBy(nodes, 'type');
    return (
      <div id="dataTable">
        <HeaderPortal>
          <div className="exportButtons">
            <Button onClick={() => this.export('xlsx')}>Export xlsx</Button>
            <Button onClick={() => this.download('pdf')}>Export pdf</Button>
            <Button onClick={() => this.download('png')}>Export png</Button>
          </div>
        </HeaderPortal>
        <div className={`contentWrapper ${fullWidth ? 'fullWidth' : ''}`}>
          <div className="header">
            <h3>
              <span className={activeTab.type === 'nodes' ? 'circle' : 'line'} />
              {activeTab.type}
            </h3>
            <div className="buttons">
              <Button icon="fa-expand" onClick={this.toggleFullWidth} />
              <Button icon="fa-times" onClick={this.close} />
            </div>
          </div>
          <div className="ghGridTableWrapper">
            {activeTab.group === 'nodes' ? (
              <DataTableNodes title={activeTab.type} nodes={nodesGrouped[activeTab.type]} />
            ) : (
              <DataTableLinks title={activeTab.type} links={linksGrouped[activeTab.type]} />
            )}
          </div>
          <div className="tabs">
            <span className="empty" />
            {_.map(nodesGrouped, (n, type) => (
              <Button
                className={activeTab.type === type && activeTab.group === 'nodes' ? 'active' : ''}
                onClick={() => this.setActiveTab('nodes', type)}
              >
                {type || '__empty__'}
                <sub>{`[${n.length}]`}</sub>
              </Button>
            ))}
            {_.map(linksGrouped, (n, type) => (
              <Button
                className={activeTab.type === type && activeTab.group === 'links' ? 'active' : ''}
                onClick={() => this.setActiveTab('links', type)}
              >
                {type || '__empty__'}
                <sub>{`[${n.length}]`}</sub>
              </Button>
            ))}
            <span className="empty" />
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
  setLoading,
  setGridIndexes,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(DataView);

export default Container;
