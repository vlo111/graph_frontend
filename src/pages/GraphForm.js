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
import { clearSingleGraph, getSingleGraphRequest, setActiveMouseTracker } from '../store/actions/graphs';
import AddLinkModal from '../components/chart/AddLinkModal';
import Zoom from '../components/Zoom';
import Search from '../components/search/Search';
import AutoPlay from '../components/AutoPlay';
import MapsGraph from '../components/maps/MapsGraph';
import NodeFullInfo from '../components/nodeInfo/NodeFullInfo';
import AddLabelModal from '../components/chart/AddLabelModal';
import LabelTooltip from '../components/LabelTooltip';
import ToolBarHeader from '../components/ToolBarHeader';
import ToolBarFooter from '../components/ToolBarFooter';
import CreateGraphModal from '../components/CreateGraphModal';
import { socketSetActiveGraph } from '../store/actions/socket';
import AutoSave from '../components/AutoSave';
import LabelShare from '../components/share/LabelShare';
import MediaModal from '../components/Media/MediaModal';
import LabelCopy from '../components/labelCopy/LabelCopy';
import FindPath from '../components/FindPath';
import FindNode from '../components/FindNode';
import MousePosition from '../components/chart/MousePosition';
import ExitMode from '../components/ExitMode';
import AddLinkedInModal from '../components/chart/AddLinkedInModal';
import MapsModal from '../components/maps/MapsModal';
import ScienceGraphModal from "../components/ScienceSearchToGraph/ScienceGraphModal";
import WikiModal from "../components/wikipedia/WikiModal";

class GraphForm extends Component {
  static propTypes = {
    getSingleGraphRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    clearSingleGraph: PropTypes.func.isRequired,
    socketSetActiveGraph: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    currentUserId: PropTypes.number.isRequired,
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

  getMouseMoveTracker = () => {
    const { mouseMoveTracker, currentUserId } = this.props;
    return mouseMoveTracker && mouseMoveTracker.some(
      (m) => m.userId !== currentUserId && m.tracker === true,
    );
  }

  render() {
    const { activeButton, mouseMoveTracker, match: { params: { graphId } } } = this.props;
    const isTracker = this.getMouseMoveTracker();
    this.getSingleGraph(graphId);
    return (
      <Wrapper className="graphsPage" showHeader={false} showFooter={false}>
        <>
          <div className="graphWrapper">
            <ReactChart />
          </div>
          <ToolBarHeader />
          <ToolBar />
          <Crop />
          <AddNodeModal />
          {activeButton === 'data' && <DataView />} 
        <Search history={this.props.history} />
        {activeButton === 'media' && <MediaModal history={this.props.history} /> }
        {activeButton === 'maps-view' && <MapsGraph />}
        {activeButton === 'maps' && <MapsModal />}
        {activeButton === 'sciGraph' && <ScienceGraphModal />}
        {activeButton === 'wikipedia' && <WikiModal />}
        <AddLinkModal />
        <AddLabelModal />
        <AddLinkedInModal />
        <ContextMenu />
        <DataImport />
        <FindNode />
        <NodeDescription />
        <NodeFullInfo />
        <AutoPlay />
        <Zoom />
        <LabelTooltip />
        <CreateGraphModal />
        <LabelShare />
        <LabelCopy />
        <AutoSave />
        <ExitMode />
          <ToolBarFooter />
        {isTracker && <MousePosition graphId={graphId} /> }
        </> 
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraphLabels: state.graphs.singleGraph.labels || [],
  mouseMoveTracker: state.graphs.mouseMoveTracker,
  currentUserId: state.account.myAccount.id,
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
