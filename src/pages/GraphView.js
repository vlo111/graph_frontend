import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Tooltip from 'rc-tooltip';
import { toast } from 'react-toastify';
import Wrapper from '../components/Wrapper';
import ReactChart from '../components/chart/ReactChart';
import { setActiveButton } from '../store/actions/app';
import Button from '../components/form/Button';
import { ReactComponent as EditSvg } from '../assets/images/icons/edit.svg';
import { ReactComponent as TrashSvg } from '../assets/images/icons/trash.svg';
import { ReactComponent as UndoSvg } from '../assets/images/icons/undo.svg';
import Filters from '../components/filters/Filters';
import AccountDropDown from '../components/account/AccountDropDown';
import NodeDescription from '../components/NodeDescription';
import { deleteGraphRequest, getSingleGraphRequest } from '../store/actions/graphs';
import NodeFullInfo from '../components/nodeInfo/NodeFullInfo';
import { userGraphRequest } from '../store/actions/shareGraphs';
import ShareGraph from '../components/ShareGraph';
import LabelTooltip from '../components/LabelTooltip';
import Legend from '../components/Legend';

class GraphView extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    deleteGraphRequest: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    userGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    userGraphs: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      openShareModal: false,
    };
  }

  componentDidMount() {
    const { match: { params: { graphId } } } = this.props;
    this.props.setActiveButton('view');
    this.props.userGraphRequest();
    if (+graphId) {
      this.props.getSingleGraphRequest(graphId);
    }
  }

  deleteGraph = async () => {
    const { match: { params: { graphId = '' } } } = this.props;
    if (window.confirm('Are you sure?')) {
      await this.props.deleteGraphRequest(graphId);
      this.props.history.push('/');
      toast.info('Successfully deleted');
    }
  }

  shareGraph = async () => {
    if (window.confirm('Are you sure?')) {
      this.setState({ openShareModal: true });
    }
  }

  render() {
    const {
      singleGraph, userGraphs, location: { pathname }, match: { params: { graphId = '' } },
    } = this.props;
    const preview = pathname.startsWith('/graphs/preview/');
    const userGraph = userGraphs && userGraphs.find((item) => item.graphId === +graphId);

    return (
      <Wrapper className="graphView" showFooter={false}>
        <div className="graphWrapper">
          <AccountDropDown />
          <ReactChart />
        </div>
        {preview ? (
          <div className="graphPreview">
            <h1 className="title">{singleGraph.title}</h1>
            <p className="description">
              {singleGraph.description}
            </p>
            <div>
              <strong>{'Nodes: '}</strong>
              {singleGraph.nodes?.length}
            </div>
            <div>
              <strong>{'Links: '}</strong>
              {singleGraph.links?.length}
            </div>
            <div>
              <strong>{'Views: '}</strong>
              {singleGraph.views}
            </div>
            <Link className="ghButton view" to={`/graphs/view/${graphId}`} replace>
              View Graph
            </Link>
          </div>
        ) : (
          <>
            { (!userGraph || userGraph.role === 'admin' || userGraph.role === 'edit') && (
            <>
              <Link to={`/graphs/update/${graphId}`}>
                <Tooltip overlay="Update">
                  <Button icon={<EditSvg style={{ height: 30 }} />} className="transparent edit" />
                </Tooltip>
              </Link>
              <Tooltip overlay="Delete">
                <Button
                  icon={<TrashSvg style={{ height: 30 }} />}
                  onClick={this.deleteGraph}
                  className="transparent delete"
                />
              </Tooltip>
            </>
            )}
            <ShareGraph graphId={+graphId} />
            <NodeDescription />
            <Link to="/">
              <Tooltip overlay="Back">
                <Button icon={<UndoSvg style={{ height: 30 }} />} className="transparent back" />
              </Tooltip>
            </Link>
          </>
        )}
        <Legend />
        <Filters />
        <NodeFullInfo editable={false} />
        <LabelTooltip />
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  singleGraph: state.graphs.singleGraph,
  userGraphs: state.shareGraphs.userGraphs,
});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
  deleteGraphRequest,
  userGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphView);

export default Container;
