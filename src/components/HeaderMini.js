import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import queryString from 'query-string';
import SearchInput from './search/SearchInput';
import AccountDropDown from './account/AccountDropDown';
import Utils from '../helpers/Utils';
import GraphUsersInfo from './GraphUsersInfo';
import Button from './form/Button';

class HeaderMini extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showGraphUsersInfo: false,
    };
  }

  toggleGraphUsersInfo = (showGraphUsersInfo) => {
    this.setState({ showGraphUsersInfo });
  }

  render() {
    const { showGraphUsersInfo } = this.state;
    const { match: { params: { graphId = '', token = '' } } } = this.props;
    const isInEmbed = Utils.isInEmbed();
    return (
      <header id="headerMini">
        <SearchInput />
        <ul className="links">
          <li>
            <Link to={isInEmbed ? `/graphs/embed/filter/${graphId}/${token}` : `/graphs/filter/${graphId}`}>
              Filter
            </Link>
          </li>
          <li>
            <Button onClick={() => this.toggleGraphUsersInfo(true)}>
              Info
            </Button>
          </li>
        </ul>
        {!isInEmbed ? (
          <AccountDropDown mini />
        ) : null}

        {showGraphUsersInfo ? (
          <GraphUsersInfo onClose={() => this.toggleGraphUsersInfo(false)} />
        ) : null}
      </header>
    );
  }
}

export default withRouter(HeaderMini);
