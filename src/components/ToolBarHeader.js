import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from './form/Button';
import { setActiveButton } from '../store/actions/app';
import { ReactComponent as Logo, ReactComponent as LogoSvg } from '../assets/images/logo.svg';
import { ReactComponent as SearchSvg } from '../assets/images/icons/search.svg';
import { ReactComponent as ViewSvg } from '../assets/images/icons/view.svg';
import { ReactComponent as FilterSvg } from '../assets/images/icons/filter.svg';
import { getSingleGraphRequest } from '../store/actions/graphs';
import ShareGraph from './ShareGraph';
import AccountDropDown from './account/AccountDropDown';
import Legend from './Legend';
import MapsButton from './maps/MapsButton';
import Utils from '../helpers/Utils';
import WikiButton from './wiki/WikiButton';
import ApiButton from './apiSearchToGraph/apiGraphButton';

import { ReactComponent as MediaSvg } from '../assets/images/icons/gallery.svg';
import SearchModal from './search/SearchModal';

class ToolBarHeader extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,

  }

  handleClick = (button) => {
    this.props.setActiveButton(button);
  }

  resetGraph = () => {
    const { match: { params: { graphId } } } = this.props;
    if (window.confirm('Are you sure?')) {
      this.props.getSingleGraphRequest(graphId);
    }
  }

  render() {
    const { activeButton, location: { pathname }, match: { params: { graphId, token = '' } } } = this.props;
    const isInEmbed = Utils.isInEmbed();
    const updateLocation = pathname.startsWith('/graphs/update/');
    return (
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

          {updateLocation ? (
            <ApiButton />
          ) : null}

          <div className="signOut">
            <AccountDropDown />
          </div>

        </header>
        {activeButton === 'search' && <SearchModal history={this.props.history} />}
      </div>
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
)(ToolBarHeader);

export default withRouter(Container);
