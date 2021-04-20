import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import Wrapper from '../components/Wrapper';
import ToolBar from '../components/ToolBar';
import ReactChart from '../components/chart/ReactChart';
import AddNodeModal from '../components/chart/AddNodeModal';
import Crop from '../components/chart/Crop';
import ContextMenu from '../components/contextMenu/ContextMenu';
import DataView from '../components/dataView/DataView';
import DataImport from '../components/import/DataImportModal';
import NodeDescription from '../components/NodeDescription';
import { setActiveButton } from '../store/actions/app';
import { clearSingleGraph, getSingleGraphRequest } from '../store/actions/graphs';
import AddLinkModal from '../components/chart/AddLinkModal';
import Zoom from '../components/Zoom';
import SearchModal from '../components/search/SearchModal';
import AutoPlay from '../components/AutoPlay';
import MapsGraph from '../components/maps/MapsGraph';
import NodeFullInfo from '../components/nodeInfo/NodeFullInfo';
import AddLabelModal from '../components/chart/AddLabelModal';
import LabelTooltip from '../components/LabelTooltip';
import ToolBarHeader from '../components/ToolBarHeader';
import CreateGraphModal from '../components/CreateGraphModal';
import { socketSetActiveGraph } from '../store/actions/socket';
import AutoSave from '../components/AutoSave';
import LabelShare from '../components/share/LabelShare';
import MediaModal from '../components/Media/MediaModal';
import LabelCopy from '../components/labelCopy/LabelCopy';
import FindPath from '../components/FindPath';
import ReactChartMap from "../components/chart/ReactChartMap";

class GraphForm extends Component {
  static propTypes = {
    getSingleGraphRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    clearSingleGraph: PropTypes.func.isRequired,
    socketSetActiveGraph: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
  }

  getSingleGraph = memoizeOne((graphId) => {
    this.props.setActiveButton('create');
    if (+graphId) {
      this.props.getSingleGraphRequest(graphId);
    } else {
      this.props.clearSingleGraph();
    }
    this.props.socketSetActiveGraph(+graphId || null);
  })

  render() {
    const { activeButton, match: { params: { graphId } } } = this.props;
    this.getSingleGraph(graphId);
    return (
      <Wrapper className="graphsPage" showHeader={false} showFooter={false}>
        <div className="graphWrapper">
          <ReactChart />
          <ReactChartMap />
        </div>
        <ToolBarHeader />
        <ToolBar />
        <Crop />
        <AddNodeModal />
        {activeButton === 'data' && <DataView />}
        {activeButton.includes('findPath')
        && (
        <FindPath
          history={this.props.history}
          start={activeButton.substring(activeButton.length, activeButton.indexOf('.') + 1)}
        />
        )}
        {activeButton === 'search' && <SearchModal history={this.props.history} />}
        {activeButton === 'media' && <MediaModal history={this.props.history} /> }
        {activeButton === 'maps-view' && <MapsGraph />}
        <AddLinkModal />
        <AddLabelModal />
        <ContextMenu />
        <DataImport />
        <NodeDescription />
        <NodeFullInfo />
        <AutoPlay />
        <Zoom />
        <LabelTooltip />
        <CreateGraphModal />
        <LabelShare />
        <LabelCopy />
        <AutoSave />
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraphLabels: state.graphs.singleGraph.labels || [],
});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
  socketSetActiveGraph,
  clearSingleGraph,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphForm);

export default Container;
