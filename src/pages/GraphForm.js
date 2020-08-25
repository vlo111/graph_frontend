import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Wrapper from '../components/Wrapper';
import ToolBar from '../components/ToolBar';
import ReactChart from '../components/chart/ReactChart';
import AddNodeModal from '../components/chart/AddNodeModal';
import Crop from '../components/chart/Crop';
import ContextMenu from '../components/ContextMenu';
import DataView from '../components/dataView/DataView';
import DataImport from '../components/import/DataImportModal';
import NodeDescription from '../components/NodeDescription';
import { setActiveButton } from '../store/actions/app';
import { getSingleGraphRequest } from '../store/actions/graphs';
import AddLinkModal from '../components/chart/AddLinkModal';
import Zoom from '../components/Zoom';
import AccountDropDown from '../components/account/AccountDropDown';
import SearchModal from '../components/search/SearchModal';

class GraphForm extends Component {
  static propTypes = {
    getSingleGraphRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
  }

  componentDidMount() {
    const { match: { params: { graphId } } } = this.props;
    this.props.setActiveButton('create');
    if (+graphId) {
      this.props.getSingleGraphRequest(graphId);
    }
  }

  render() {
    const { activeButton } = this.props;
    return (
      <Wrapper className="graphsPage" showHeader={false} showFooter={false}>
        <div className="graphWrapper">
          {activeButton === 'data' ? <DataView /> : null}
          <ReactChart />
        </div>
        <ToolBar />
        <AccountDropDown />
        <Crop />
        <AddNodeModal />
        {activeButton === 'search' && <SearchModal />}
        <AddLinkModal />
        <ContextMenu />
        <DataImport />
        <NodeDescription />
        <Zoom />
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphForm);

export default Container;
