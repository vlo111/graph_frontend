import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import Button from './form/Button';
import { setActiveButton } from '../store/actions/app';
import { ReactComponent as LogoSvg } from '../assets/images/logo.svg';
import { ReactComponent as SearchSvg } from '../assets/images/icons/search.svg';
import { socketMousePositionTracker } from '../store/actions/socket';
import AccountDropDown from './account/AccountDropDown';
import Legend from './Legend';
import GraphSettings from './graphData/GraphSettings';
import { ReactComponent as CommentSvg } from '../assets/images/icons/commentGraph.svg';
import CommentModal from './CommentModal/CommentModal';
import Notification from './Notification';
import { KEY_CODES } from '../data/keyCodes';
import ContributorsModal from './Contributors';
import { ReactComponent as CursorSvg } from '../assets/images/icons/cursor.svg';
import { ReactComponent as NotifySvg } from '../assets/images/icons/notification.svg';
import Chart from '../Chart';
import ChartUtils from '../helpers/ChartUtils';
import { ReactComponent as NotifyEmptySvg } from '../assets/images/icons/notificationComplete.svg';
import Utils from '../helpers/Utils';

class ToolBarHeader extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    socketMousePositionTracker: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    currentUserId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      mouseTracker: false,
      commentModal: false,
    };
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);

    const notifyElement = document.querySelector('.notification');

    setTimeout(() => {
      if (notifyElement) {
        const dataCount = notifyElement.getAttribute('data-count');
        if (dataCount === 0) {
          notifyElement.innerHTML = ReactDOMServer.renderToString(<NotifyEmptySvg />);
        } else {
          notifyElement.innerHTML = ReactDOMServer.renderToString(<NotifySvg />);
        }
      }
    }, 100);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleClick = (button) => {
    this.props.setActiveButton(button);
  }

  openCommentModal = (open) => {
    this.setState({ commentModal: open });
  }

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
    if (ev.chartEvent && !ev.ctrlPress && ev.shiftKey && !ev.altKey) {
      if (ev.keyCode === KEY_CODES.search_code) {
        ChartUtils.keyEvent(ev);
        ev.preventDefault();
        this.handleClick('search');
      }

      if (ev.keyCode === KEY_CODES.graphScience_code) {
        ChartUtils.keyEvent(ev);
        ev.preventDefault();
        this.handleClick('sciGraph');
      }

      if (ev.keyCode === KEY_CODES.media_code) {
        ChartUtils.keyEvent(ev);
        ev.preventDefault();
        this.handleClick('media');
      }
    }
  };

  render() {
    const {
      activeButton, singleGraph, currentUserId, location: { pathname }, match: { params: { graphId } },
    } = this.props;
    const { mouseTracker, commentModal } = this.state;
    const singleGraphUser = singleGraph.user;
    this.props.socketMousePositionTracker(graphId, mouseTracker, currentUserId);

    const updateLocation = pathname.startsWith('/graphs/update/');
    const filter = pathname.startsWith('/graphs/filter/');
    const view = pathname.startsWith('/graphs/view/');
    return (
      <>
        <header id={!updateLocation ? 'header-on-view-graph' : 'header-on-graph'}>
          <ul className="container">
            <li className="logo">
              <Link to="/" className="logoWrapper">
                <LogoSvg className="orange" />
                <span className="autoSaveText">Saving...</span>
              </Link>
            </li>
            <li className="legend">
              {updateLocation && <Legend singleGraph={singleGraph} /> }
            </li>
            <li>
              { !filter && !view
                && (
                <div className="graphs">
                  <Button
                    icon={<SearchSvg />}
                    className={activeButton === 'search' ? 'active' : undefined}
                    onClick={() => this.handleClick('search')}
                  >
                    Search
                  </Button>
                </div>
                )}
            </li>
            <li>
              {updateLocation ? (
                <GraphSettings singleGraph={singleGraph} />
              ) : null}
              {!updateLocation && (
              <span className="graphNames">
                {Utils.substr(singleGraph.title, 16)}
              </span>
              )}
            </li>
            <li className="user">
              {updateLocation && (
              <div className="button-group social-button-group">

                {graphId && <ContributorsModal graphId={graphId} graphOwner={singleGraphUser} isOwner="true" />}
              </div>
              )}
            </li>
            <li className="cursor">
              <div className="header-right-panel">
                {updateLocation && (
                <div
                  className={`cursor-header ${mouseTracker ? 'activeMouseTracker' : 'mouseTracker'}`}
                  onClick={() => this.handleCursor(mouseTracker)}
                  title={`${mouseTracker ? 'hide collaborators cursor' : 'show collaborators cursor'}`}
                >
                  <CursorSvg />
                </div>
                )}
                {updateLocation && (
                <div className="commentHeader">
                  <Button
                    icon={<CommentSvg />}
                    className="transparent footer-icon"
                    onClick={() => this.openCommentModal(true)}
                    title="Comments"
                  />
                </div>
                )}
                <div className="notify_container">
                  <div className="notificationHeader">
                    <Notification />
                  </div>
                </div>
              </div>
            </li>
            <li className="user">
              <div className="signOut">
                <AccountDropDown />
              </div>
            </li>
          </ul>
        </header>
        {commentModal && (
        <CommentModal
          closeModal={() => this.openCommentModal(false)}
          graph={singleGraph}
        />
        )}
      </>
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
  socketMousePositionTracker,
};
const Container = connect(mapStateToProps, mapDispatchToProps)(ToolBarHeader);

export default withRouter(Container);
