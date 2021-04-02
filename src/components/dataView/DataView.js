import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { setActiveButton, setGridIndexes, setLoading } from '../../store/actions/app';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as FullScreen } from '../../assets/images/icons/full-screen.svg';
import { ReactComponent as CompressScreen } from '../../assets/images/icons/compress.svg';
import { ReactComponent as ExportSvg } from '../../assets/images/icons/export.svg';
import Chart from '../../Chart';
import Button from '../form/Button';
import DataTableNodes from './DataTableNodes';
import DataTableLinks from './DataTableLinks';
import Api from '../../Api';
import ChartUtils from '../../helpers/ChartUtils';
import Utils from '../../helpers/Utils';
import Select from '../form/Select';
import Outside from '../Outside';
import { EXPORT_TYPES } from '../../data/export';

class DataView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
    customFields: PropTypes.object.isRequired,
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
      exportType: 'png',
      showExport: false,
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

  export = async (type) => {
    const { selectedGrid, customFields } = this.props;
    let nodes = _.clone(Chart.getNodes()).filter((d) => ChartUtils.isCheckedNode(selectedGrid, d));
    const links = Chart.getLinks().filter((d) => ChartUtils.isCheckedLink(selectedGrid, d));
    const labels = Chart.getLabels(); // todo filter empty labels

    const icons = await Promise.all(nodes.map((d) => {
      if (d.icon && d.icon.startsWith('blob:')) {
        return Utils.blobToBase64(d.icon);
      }
      return d.icon;
    }));

    const files = [];
    /* eslint-disable */
    for (const d of nodes) {
      const reg = /\shref="(blob:[^"]+)"/g;
      let m;
      while (m = reg.exec(d.description)) {
        const file = await Utils.blobToBase64(m[1]);
        files.push(file);
      }
    }
    /* eslint-enable */

    nodes = nodes.map((d, i) => {
      d.icon = icons[i];
      d.description = d.description.replace(/\shref="(blob:[^"]+)"/g, () => ` href="${files.shift()}"`);
      return d;
    });

    if (type === 'csv') {
      Api.download('csv-nodes', { nodes });
      if (!_.isEmpty(links)) {
        Api.download('csv-links', { links });
      }
      return;
    }
    Api.download(type, {
      nodes, links, labels, customFields,
    });
  }

  download = async (type) => {
    this.props.setLoading(true);
    const svg = Chart.printMode(1900, 1060, true);
    await Api.download(type, { svg });
    this.props.setLoading(false);
  }

  closeExport = (ev) => {
    const isSelectType = typeof (ev.target.className) === 'string'
      ? !!ev.target.className?.includes('gh__option')
      : false;

    if (!isSelectType) {
      const { showExport } = this.state;
      this.setState({ showExport: !showExport });
    }
  }

  handleExport = () => {
    const { exportType } = this.state;

    switch (exportType) {
      case 'png': {
        this.download('png');
        break;
      }
      case 'zip': {
        this.export('zip');
        break;
      }
      case 'pdf': {
        this.download('pdf');
        break;
      }
      case 'excel': {
        this.export('xlsx');
        break;
      }
      default:
        this.download('png');
    }
  }

  render() {
    const {
      fullWidth, activeTab, exportType, showExport,
    } = this.state;

    const nodes = Chart.getNodes().filter((d) => !d.sourceId && !d.fake);
    const links = ChartUtils.cleanLinks(Chart.getLinks(), nodes);

    const linksGrouped = _.groupBy(links, 'type');
    const nodesGrouped = _.groupBy(nodes, 'type');
    let color = '';

    if (links.length) {
      if (activeTab.group === 'links') {
        color = links.find((p) => p.type === activeTab.type).color;
      } else if (activeTab.group === 'nodes') {
        color = nodes.find((p) => p.type === activeTab.type).color;
      } else color = '';
    }
    return (
      <div id="dataTable" className={fullWidth ? 'fullWidth' : undefined}>
        <div className="contentWrapper">
          <div className="header">
            <div className="exportData">
              <div className="exportContent">
                <Button onClick={this.closeExport} className="showExportButton" icon={<ExportSvg />} />
                {showExport ? (
                  <Outside onClick={(ev) => this.closeExport(ev)} exclude=".exportData">
                    <div className="exportDropDown">
                      <Select
                        label="Type File"
                        portal
                        options={EXPORT_TYPES}
                        value={EXPORT_TYPES.filter((t) => t.value === exportType)}
                        onChange={(v) => this.setState({ exportType: v.value })}
                      />
                      <Button onClick={this.handleExport} className="exportButton ghButton accent alt" type="submit">
                        Export
                      </Button>
                    </div>
                  </Outside>
                ) : null}
              </div>
            </div>
            <h4>
              <span style={{ backgroundColor: color }} className={activeTab.group === 'nodes' ? 'circle' : 'line'} />
              {activeTab.type}
            </h4>
            <div className="buttons">
              <Button icon={fullWidth ? <CompressScreen /> : <FullScreen />} onClick={this.toggleFullWidth} />
              <Button icon={<CloseSvg />} onClick={this.close} />
            </div>
          </div>
          <div className="ghGridTableWrapper">
            {activeTab.group === 'nodes' ? (
              <DataTableNodes
                classNamePos={showExport && 'tablePosition'}
                title={activeTab.type}
                nodes={nodesGrouped[activeTab.type]}
              />
            ) : (
              <DataTableLinks
                classNamePos={showExport && 'tablePosition'}
                title={activeTab.type}
                links={linksGrouped[activeTab.type]}
              />
            )}
          </div>
          <div className="tabs">
            <div className="nodesMode">
              <span>
                Nodes (
                {nodes.length}
                )
              </span>
            </div>
            <div>
              {_.map(nodesGrouped, (n, type) => (
                <Button
                  key={type}
                  className={activeTab.type === type && activeTab.group === 'nodes' ? 'active' : ''}
                  onClick={() => this.setActiveTab('nodes', type)}
                >
                  {type || '__empty__'}
                  <sub>{`[${n.length}]`}</sub>
                </Button>
              ))}
            </div>
            <div className="linksMode">
              <span>
                Links (
                {links.length}
                )
              </span>
            </div>
            <div>
              {_.map(linksGrouped, (n, type) => (
                <Button
                  key={type}
                  className={activeTab.type === type && activeTab.group === 'links' ? 'active' : ''}
                  onClick={() => this.setActiveTab('links', type)}
                >
                  {type || '__empty__'}
                  <sub>{`[${n.length}]`}</sub>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  selectedGrid: state.app.selectedGrid,
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  setActiveButton,
  setLoading,
  setGridIndexes,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataView);

export default Container;
