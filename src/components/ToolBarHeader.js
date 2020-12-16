import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from './form/Button';
import SearchInput from './search/SearchInput';
import { setActiveButton } from '../store/actions/app';
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import { ReactComponent as SearchSvg } from '../assets/images/icons/search.svg';
import { ReactComponent as ViewSvg } from '../assets/images/icons/view.svg';
import { ReactComponent as FilterSvg } from '../assets/images/icons/filter.svg';
import { getSingleGraphRequest } from '../store/actions/graphs';
import ShareGraph from './ShareGraph';
import AccountDropDown from '../components/account/AccountDropDown';
import Legend from '../components/Legend';
import MapsButton from '../components/maps/MapsButton';
import Utils from '../helpers/Utils';
import WikiButton from "./wiki/WikiButton";
import { ReactComponent as LogoSvg } from '../assets/images/logo.svg';

class ToolBarHeader extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
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
    const { activeButton, match: { params: { graphId, token = '' } } } = this.props;
    const isInEmbed = Utils.isInEmbed();
    return (
      <header id="header">
        <Link to="/" className="logoWrapper">
          <LogoSvg className="logo orange" />
          <span className="autoSaveText">Saving...</span>
        </Link>
        <AccountDropDown />
        <MapsButton />
        <WikiButton />
        <Legend />
        <div className="graphs">
          <Button
            icon={<SearchSvg />}
            className={activeButton === 'search' ? 'active' : undefined}
            onClick={() => this.handleClick('search')}
          >
            Search
          </Button>

          {/* <SearchInput /> */}
          <ShareGraph graphId={+graphId} setButton />
          <Button
            icon={<ViewSvg />}
            onClick={() => this.props.history.replace(`/graphs/view/${graphId}`)}
          >
            View mode
          </Button>
          <Button
            icon={<FilterSvg />}
            onClick={() => {
              isInEmbed ? this.props.history.replace(`/graphs/embed/filter/${graphId}/${token}`)
                : this.props.history.replace(`/graphs/filter/${graphId}`)
            }}
          >
           Filter
          </Button>
        </div>

      </header>
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
