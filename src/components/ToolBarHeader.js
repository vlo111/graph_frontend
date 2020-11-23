import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from './form/Button';
import { setActiveButton } from '../store/actions/app';
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import { ReactComponent as SearchSvg } from '../assets/images/icons/search.svg';
import { ReactComponent as ViewSvg } from '../assets/images/icons/view.svg';
import { getSingleGraphRequest } from '../store/actions/graphs';
import ShareGraph from './ShareGraph';
import AccountDropDown from '../components/account/AccountDropDown';
import Legend from '../components/Legend';
import MapsButton from '../components/maps/MapsButton';

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
    const { activeButton, match: { params: { graphId } } } = this.props;
    return (
      <header id="header">
        <Link to="/" className="logoWrapper">
          <Logo className="logo" />
          <span className="autoSaveText">Saving...</span>
        </Link>
        <AccountDropDown />
        <MapsButton />
        <Legend />
        <div className="graphs">
          <Button
            icon={<SearchSvg />}
            className={activeButton === 'search' ? 'active' : undefined}
            onClick={() => this.handleClick('search')}
          >
            Search
          </Button>
          <ShareGraph graphId={+graphId} setButton />
          <Button
            icon={<ViewSvg />}
            onClick={() => this.props.history.replace(`/graphs/view/${graphId}`)}
          >
            View mode
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
