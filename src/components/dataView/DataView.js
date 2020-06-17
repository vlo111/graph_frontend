import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setActiveButton } from '../../store/actions/app';
import Chart from '../../Chart';
import Button from '../form/Button';
import HeaderPortal from '../form/HeaderPortal';
import DataTableNodes from './DataTableNodes';
import DataTableLinks from './DataTableLinks';


class DataView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      fullWidth: false,
      activeTab: 'nodes',
    };
  }

  componentDidMount() {
    Chart.svgSize();
  }

  componentWillUnmount() {
    setTimeout(() => {
      Chart.svgSize();
    }, 100);
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

  handleSelectChange = (selectedNodes) => {

  }

  exportCsv = () => {

  }

  render() {
    const { fullWidth, activeTab } = this.state;
    const links = Chart.getLinks();
    const nodes = Chart.getNodes();

    return (
      <div id="dataTable">
        <HeaderPortal>
          <Button onClick={this.exportCsv}>Export Csv</Button>
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
});
const mapDespatchToProps = {
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(DataView);

export default Container;
