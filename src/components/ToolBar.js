import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import Button from './form/Button';
import { setActiveButton } from '../store/actions/app';
import SaveGraph from './chart/SaveGraph';
import Undo from './Undo';
import { ReactComponent as InfoSvg } from '../assets/images/icons/info.svg';
import { ReactComponent as AddSvg } from '../assets/images/icons/add.svg';
import { ReactComponent as LoopSvg } from '../assets/images/icons/loop.svg';
import { ReactComponent as TagSvg } from '../assets/images/icons/tag.svg';
import { getSingleGraphRequest } from '../store/actions/graphs';
import ShareTooltip from './ShareTooltip/ShareTooltip';
import { ReactComponent as SquareSvg } from '../assets/images/icons/square.svg';
import { ReactComponent as EllipseSvg } from '../assets/images/icons/ellipse.svg';
import { ReactComponent as FreeFormSvg } from '../assets/images/icons/freeForm.svg';
import { ReactComponent as AnalyticsSvg } from '../assets/images/icons/analytics.svg';
import { ReactComponent as CursorSvg } from '../assets/images/icons/move_pointe.svg';
import AnalyseModal from './Analysis/AnalyseModal';
import ChartUtils from '../helpers/ChartUtils';
import { KEY_CODES } from '../data/keyCodes';
class ToolBar extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
  }

  constructor() {
    super();
    this.state = { showLabelForm: false };
  }

  componentDidMount () {
    window.addEventListener('keydown', this.handleKeyDown);
  }
  componentWillUnmount () {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (ev) => {
    if (ev.chartEvent && ev.ctrlPress && !ev.shiftKey) {
      if (ev.keyCode === KEY_CODES.analytic_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('analytic')
      }
      if (ev.keyCode === KEY_CODES.import_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('import')
      }
      if (ev.keyCode === KEY_CODES.data_code) {
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('data')
      }
      if (ev.keyCode === KEY_CODES.label_code) { 
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('create-label')
      }
      if (ev.keyCode === KEY_CODES.label_ellipse_code) { 
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('create-label-ellipse')
      }
    }
    if (ev.chartEvent && ev.shiftKey && !ev.ctrlPress) {
      if (ev.keyCode === KEY_CODES.label_code) { 
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('create-label-square')
      }
      if (ev.keyCode === KEY_CODES.data_code) { 
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('create')
      }
      if ( ev.keyCode === KEY_CODES.search_code) { 
        ev.preventDefault();
        ChartUtils.keyEvent(ev);
        this.handleClick('findNode')
      }
    }
    if (ev.keyCode === 27) {
      this.props.setActiveButton('create')
    }
  }

  handleClick = async (button) => {
    if (button === 'analytic') {

      const {
        match: { params: { graphId } },
      } = this.props;

      await this.initialGraph(graphId);

      const { nodes, links } = this.props.singleGraph;

      if (!(nodes && nodes.length && links && links.length)) {
        this.props.setActiveButton('analyse');
      } else {
        this.props.history.replace(`/graphs/view/${graphId}?analytics`);
      }
    } else {
      this.setState({ showLabelForm: false });
      this.props.setActiveButton(button);
    }
  }

  resetGraph = () => {
    const { match: { params: { graphId } } } = this.props;
    if (window.confirm('Are you sure?')) {
      this.props.getSingleGraphRequest(graphId);
    }
  }

  initialGraph = memoizeOne(async (graphId) => {
    await this.props.getSingleGraphRequest(graphId, { full: true });
  });

  render() {
    const {
      activeButton, match: { params: { graphId } }, currentUserRole, singleGraphUser,
    } = this.props;

    const {
      showLabelForm,
    } = this.state;

    return (
      <div id="toolBar">
        <div className="top">

          <SaveGraph />
          <Undo />
          <div className="actionButtons">
            <Button
              className={activeButton === 'create' ? 'active' : undefined}
              icon={<CursorSvg />}
              onClick={() => this.handleClick('create')}
            >
              Dashboard
            </Button>
            <Button
              className={activeButton === 'findNode' ? 'active' : undefined}
              icon={<LoopSvg />}
              onClick={() => this.handleClick('findNode')}
            >
              Find Node
            </Button>
            {currentUserRole !== 'edit_inside' ? (
              <Button
                className={activeButton === 'create-label' ? 'active' : undefined}
                icon={<TagSvg />}
                onClick={() => this.setState({ showLabelForm: !showLabelForm })}
              >
                Create Label
              </Button>
            ) : null}
            <div
              onMouseLeave={() => this.setState({ showLabelForm: false })}
              className={`labelForm ${showLabelForm ? 'showLabelForm' : null}`}
            >
              <div className="buttons">
                <span className="lblFreeForm" onClick={() => this.handleClick('create-label')}>
                  <FreeFormSvg />
                </span>
                <span className="lblEllipse" onClick={() => this.handleClick('create-label-ellipse')}>
                  <EllipseSvg />
                </span>
                <span className="lblSquare" onClick={() => this.handleClick('create-label-square')}>
                  <SquareSvg />
                </span>
              </div>
            </div>

            {false ? (
              <Button
                icon={<LoopSvg />}
                className={activeButton === 'reset' ? 'active' : undefined}
                onClick={this.resetGraph}
              >
                Reset project
              </Button>
            ) : null}

            <Button
              className={activeButton === 'data' ? 'active' : undefined}
              icon={<LoopSvg />}
              onClick={() => this.handleClick('data')}
            >
              Data sheet
            </Button>
            <Button
              className={activeButton === 'import' ? 'active' : undefined}
              icon={<LoopSvg />}
              onClick={() => this.handleClick('import')}
            >
              Import data
            </Button>
            <Button
              icon={<AnalyticsSvg />}
              onClick={() => this.handleClick('analytic')}
            >
              Analysis
            </Button>
          </div>
        </div>

        <div className="bottom ">

          {graphId && <ShareTooltip graphId={graphId} graphOwner={singleGraphUser} isOwner="true" />}
        </div>
        <div className="bottom helpWrapper">
          <Button icon={<InfoSvg />}>
            Help
          </Button>
        </div>
        <AnalyseModal />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  currentUserRole: state.graphs.singleGraph.currentUserRole || '',
  singleGraphUser: state.graphs.singleGraph.user,
  singleGraph: state.graphs.singleGraph,

});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolBar);

export default withRouter(Container);
