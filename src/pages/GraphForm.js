import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import { Redirect } from 'react-router-dom';
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
import FindNode from '../components/FindNode';
import MousePosition from '../components/chart/MousePosition';
import ExitMode from '../components/ExitMode';
import AddLinkedInModal from '../components/chart/AddLinkedInModal';
import MapsModal from '../components/maps/MapsModal';
import ScienceGraphModal from '../components/ScienceSearchToGraph/ScienceGraphModal';
import WikiModal from '../components/wikipedia/WikiModal';
import Tabs from '../components/newTab';

class GraphForm extends Component {
  static propTypes = {
    getSingleGraphRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    clearSingleGraph: PropTypes.func.isRequired,
    socketSetActiveGraph: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    singleGraphStatus: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    currentUserId: PropTypes.string.isRequired,
    mouseMoveTracker: PropTypes.array.isRequired,
    currentUserRole: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
  }

  getSingleGraph = memoizeOne((graphId) => {
    this.props.setActiveButton('create');
    if (graphId) {
      this.props.getSingleGraphRequest(graphId);
    } else {
      this.props.clearSingleGraph();
    }
    this.props.socketSetActiveGraph(graphId || null);
  })

  getMouseMoveTracker = () => {
    const { mouseMoveTracker, currentUserId } = this.props;
    return mouseMoveTracker && mouseMoveTracker.some(
      (m) => m.userId !== currentUserId && m.tracker === true,
    );
  }

  getPermission = () => {
    const { singleGraphStatus, currentUserRole } = this.props;

    return (singleGraphStatus === 'fail'
      || (singleGraphStatus === 'success'
        && currentUserRole && !['admin', 'edit', 'edit_inside'].includes(currentUserRole))
    );
  }

  render() {
    const { activeButton, match: { params: { graphId } } } = this.props;
    const isTracker = this.getMouseMoveTracker();
    this.getSingleGraph(graphId);
    const isPermission = this.getPermission();
    if (isPermission) {
      return (<Redirect to="/403" />);
    }
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
          {activeButton === 'search' && <SearchModal history={this.props.history} />}
          {activeButton === 'media' && <MediaModal history={this.props.history} />}
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
          <Tabs />
          <AutoPlay />
          <Zoom />
          <LabelTooltip />
          <CreateGraphModal />
          <LabelShare />
          <LabelCopy />
          <AutoSave />
          <ExitMode />
          <ToolBarFooter />
          {isTracker && <MousePosition graphId={graphId} />}
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
  singleGraphStatus: state.graphs.singleGraphStatus,
  currentUserRole: state.graphs.singleGraph.currentUserRole || '',
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
