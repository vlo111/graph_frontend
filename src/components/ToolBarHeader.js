import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from './form/Button';
<<<<<<< HEAD
import { setActiveButton, toggleSearch } from '../store/actions/app';
import { ReactComponent as LogoSvg } from '../assets/images/logo.svg';
=======
import { setActiveButton } from '../store/actions/app';
import { ReactComponent as Logo, ReactComponent as LogoSvg } from '../assets/images/logo.svg';
>>>>>>> origin/master
import { ReactComponent as SearchSvg } from '../assets/images/icons/search.svg';
import { getSingleGraphRequest, setActiveMouseTracker } from '../store/actions/graphs';
import { socketMousePositionTracker } from '../store/actions/socket';
import AccountDropDown from './account/AccountDropDown';
import Legend from './Legend';
<<<<<<< HEAD
import GraphSettings from './graphData/GraphSettings';
import { ReactComponent as CommentSvg } from '../assets/images/icons/commentGraph.svg';
import CommentModal from './CommentModal/CommentModal.js';
import Notification from './Notification';
import { KEY_CODES } from '../data/keyCodes';
import ContributorsModal from './Contributors';
import { ReactComponent as CursorSvg } from '../assets/images/icons/cursor.svg';
import Chart from '../Chart';
import ChartUtils from '../helpers/ChartUtils';
=======
import MapsButton from './maps/MapsButton';
import Utils from '../helpers/Utils';
import WikiButton from './wiki/WikiButton';

import { ReactComponent as MediaSvg } from '../assets/images/icons/gallery.svg';
import SearchModal from './search/SearchModal';
>>>>>>> origin/master

class ToolBarHeader extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    toggleSearch: PropTypes.func.isRequired,
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
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleClick = (button) => {
    const { match: { params: { graphId }}, location: { pathname} } = this.props;
    this.props.setActiveButton(button);
    
    if (button === 'search') {
      this.props.toggleSearch(true)
      if (!pathname.startsWith('/graphs/view')) {
        this.props.history.replace(`/graphs/view/${graphId}`);
      }
    }
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
    if (ev.chartEvent && !ev.ctrlPress && ev.shiftKey) {
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
    return (
<<<<<<< HEAD
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
              {updateLocation &&  <Legend /> }
            </li>
            <li>
              { !filter && 
                <div className="graphs">
                    <Button
                      icon={<SearchSvg />}
                      className={activeButton === 'search' ? 'active' : undefined}
                      onClick={(ev) => this.handleClick('search')}
                    >
                      Search
                    </Button>
                </div>
             }
            </li>
            <li>
              {updateLocation ? (
                <GraphSettings />
              ) : null}
              {!updateLocation && (
              <span className="graphNames">
                {singleGraph.title?.length > 16 ? `${singleGraph.title.substring(0, 16)}...` : singleGraph.title}
              </span>
              )}
            </li>
            <li className="cursor">
              {updateLocation && (
              <Button
                icon={<CursorSvg />}
                className={`transparent alt ${mouseTracker ? 'activeMouseTracker' : 'mouseTracker'}`}
                onClick={() => this.handleCursor(mouseTracker)}
                title={`${mouseTracker ? 'hide collaborators cursor' : 'show collaborators cursor'}`}
              />
              )}
            </li>
            <li className="user">
              {updateLocation && (
                  <div className="button-group social-button-group">

                    {graphId && <ContributorsModal graphId={graphId} graphOwner={singleGraphUser} isOwner="true" />}
                  </div>
              )}
            </li>
            <li>
              {updateLocation && (
                  <div className="commentHeader">
                    <Button
                        icon={<CommentSvg />}
                        className="transparent footer-icon"
                        onClick={() => this.openCommentModal(true)}
                        title='Comments'
                    />
                  </div>
              )}
            </li>
            <li className="notify_container">
              <div className="notificationHeader">
                <Notification />
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
=======
      <div>
        <header className="headerPanel" id={!updateLocation ? 'header-on-view-graph' : 'header-on-graph'}>
          <Link to="/" className="logoWrapper">
            <LogoSvg className="logo orange" />
            <span className="autoSaveText">Saving...</span>
          </Link>
          <Legend />
          {!updateLocation && (
          <div className="searchInputWrapper">
            <Button
              icon={<SearchSvg />}
              className={activeButton === 'search' ? 'active' : undefined}
              onClick={() => this.handleClick('search')}
            >
              Search
            </Button>
          </div>
          )}
          <div className="graphs">
            {updateLocation ? (
              <Button
                icon={<SearchSvg />}
                className={activeButton === 'search' ? 'active' : undefined}
                onClick={() => this.handleClick('search')}
              >
                Search
              </Button>
            ) : null}
            <ShareGraph graphId={+graphId} setButton />
            {updateLocation ? (
              <Button
                icon={<ViewSvg />}
                onClick={() => this.props.history.replace(`/graphs/view/${graphId}`)}
              >
                View
              </Button>
            ) : null}
            <Button
              icon={<FilterSvg />}
              onClick={() => {
                isInEmbed ? this.props.history.replace(`/graphs/embed/filter/${graphId}/${token}`)
                  : this.props.history.replace(`/graphs/filter/${graphId}`);
              }}
            >
              Filter
            </Button>
            {updateLocation ? (
              <Button
                icon={<MediaSvg />}
                className={activeButton === 'media' ? 'active' : undefined}
                onClick={() => this.handleClick('media')}
              >
                Media
              </Button>
            ) : null}
          </div>

          {updateLocation ? (
            <MapsButton />
          ) : null}
          {updateLocation ? (
            <WikiButton />
          ) : null}

          <div className="signOut">
            <AccountDropDown />
          </div>

        </header>
        {activeButton === 'search' && <SearchModal history={this.props.history} />}
      </div>
>>>>>>> origin/master
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
  toggleSearch
};
const Container = connect(mapStateToProps, mapDispatchToProps)(ToolBarHeader);

export default withRouter(Container);
