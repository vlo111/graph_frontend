import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import PropTypes from "prop-types";
import Button from "./form/Button";
import { setActiveButton } from "../store/actions/app";
import {
  ReactComponent as Logo,
  ReactComponent as LogoSvg,
} from "../assets/images/logo.svg";
import { ReactComponent as SearchSvg } from "../assets/images/icons/search.svg";
// import { ReactComponent as ViewSvg } from '../assets/images/icons/view.svg';
// import { ReactComponent as FilterSvg } from '../assets/images/icons/filter.svg';
import { ReactComponent as CursorSvg } from "../assets/images/icons/cursor.svg";
import {
  getSingleGraphRequest,
  setActiveMouseTracker,
} from "../store/actions/graphs";
import { socketMousePositionTracker } from "../store/actions/socket";
// import ShareGraph from './ShareGraph';
import AccountDropDown from "./account/AccountDropDown";
import Legend from "./Legend";
// import MapsButton from './maps/MapsButton';
import Utils from "../helpers/Utils";
// import WikiButton from './wiki/WikiButton';
// import ScienceButton from './ScienceSearchToGraph/ScienceGraphButton';
import ChartUtils from "../helpers/ChartUtils";
import { KEY_CODES } from "../data/keyCodes";
// import { ReactComponent as MediaSvg } from '../assets/images/icons/gallery.svg';
// import SearchModal from './search/SearchModal';
import Chart from "../Chart";
import { setLegendButton } from "../store/actions/app";
import ContributorsModal from "./Contributors";
import GraphName from "./GraphName";
// import { ReactComponent as MediaSvg } from '../assets/images/icons/gallery.svg';
// import SearchModal from './search/SearchModal';
// import SearchGraphs from './search/SearchGraphs';
import { ReactComponent as CommentSvg } from "../assets/images/icons/comm.svg";
// import Input from './form/Input';
import CommentModal from "./CommentModal/indexMini.js";
import Notification from "./Notification";

class ToolBarHeader extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    setActiveMouseTracker: PropTypes.func.isRequired,
    currentUserId: PropTypes.number.isRequired,
    graph: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      mouseTracker: false,
      commentModal: false,
    };
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }
  handleClick = (button) => {
    this.props.setActiveButton(button);
  };
  openCommentModal = (open) => {
    this.setState({ commentModal: open });
  };

  handleCursor = (tracker) => {
    const {
      currentUserId,
      match: {
        params: { graphId },
      },
    } = this.props;
    this.setState({ mouseTracker: !tracker });
    Chart.cursorTrackerListRemove();
    this.props.socketMousePositionTracker(graphId, !tracker, currentUserId);
  };

  handleKeyDown = (ev) => {
    if (ev.chartEvent && ev.ctrlPress && !ev.shiftKey) {
      if (ev.keyCode === KEY_CODES.search_code) {
        ChartUtils.keyEvent(ev);
        ev.preventDefault();
        this.handleClick("search");
      }

      if (ev.keyCode === KEY_CODES.graphScience_code) {
        ChartUtils.keyEvent(ev);
        ev.preventDefault();
        this.handleClick("sciGraph");
      }

      if (ev.keyCode === KEY_CODES.media_code) {
        ChartUtils.keyEvent(ev);
        ev.preventDefault();
        this.handleClick("media");
      }
    }
  };

  resetGraph = () => {
    const {
      match: {
        params: { graphId },
      },
    } = this.props;
    if (window.confirm("Are you sure?")) {
      this.props.getSingleGraphRequest(graphId);
    }
  };

  render() {
    const {
      activeButton,
      singleGraph,
      currentUserId,
      location: { pathname },
      match: {
        params: { token = "" },
      },
    } = this.props;
    const graphId = singleGraph.id;
    const singleGraphUser = singleGraph.user;
    const { mouseTracker, commentModal } = this.state;
    this.props.socketMousePositionTracker(graphId, mouseTracker, currentUserId);
    const isInEmbed = Utils.isInEmbed();
    const updateLocation = pathname.startsWith("/graphs/update/");

    return (
      <div>
        <header
          className="headerPanel"
          id={!updateLocation ? "header-on-view-graph" : "header-on-graph"}
        >
          <Link to="/" className="logoWrapper">
            <LogoSvg className="logoNew orange" />
            <span className="autoSaveText">Saving...</span>
          </Link>

          <Legend />
          {updateLocation ? <GraphName /> : null}

          {!updateLocation && (
            <div className="searchInputWrapper">
              <Button
                icon={<SearchSvg />}
                className={activeButton === "search" ? "active" : undefined}
                onClick={() => this.handleClick("search")}
              >
                Search
              </Button>
            </div>
          )}

          <div className="commentHeader">
            <Button
              icon={<CommentSvg />}
              className="transparent footer-icon"
              onClick={() => this.openCommentModal(true)}
            />
          </div>

          <div className="notificationHeader">
            <Notification />
          </div>
          {!updateLocation && (
            <span className="graphNames">{singleGraph.title}</span>
          )}
          <div className="graphs">
            {updateLocation ? (
              <Button
                icon={<SearchSvg />}
                className={activeButton === "search" ? "active" : undefined}
                onClick={() => this.handleClick("search")}
              >
                Search
              </Button>
            ) : null}
          </div>
          <Button
            icon={<CursorSvg />}
            className={`transparent alt ${
              mouseTracker ? "activeMouseTracker" : "mouseTracker"
            }`}
            onClick={() => this.handleCursor(mouseTracker)}
          />
          {graphId && (
            <ContributorsModal
            graphId={graphId}
            graphOwner={singleGraphUser}
            isOwner="true"
            />
          )}

          <div className="signOut">
            <AccountDropDown />
          </div>
        </header>
        {commentModal && (
          <CommentModal
            closeModal={() => this.openCommentModal(false)}
            graph={singleGraph}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  mouseTracker: state.graphs.mouseTracker,
  currentUserId: state.account.myAccount.id,
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {
  setActiveButton,
  getSingleGraphRequest,
  setActiveMouseTracker,
  socketMousePositionTracker,
  setLegendButton,
};
const Container = connect(mapStateToProps, mapDispatchToProps)(ToolBarHeader);

export default withRouter(Container);
