import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import SearchInput from "./search/SearchInput";
import AccountDropDown from "./account/AccountDropDown";

class Header extends Component {
  render() {
    const { match: { params: { graphId = '' } } } = this.props;

    return (
      <header id="headerMini">
        <SearchInput />
        <ul className="links">
          <li>
            <Link to="#">Info</Link>
          </li>
          <li>
            <Link to={`/graphs/filter/${graphId}`}>Filter</Link>
          </li>
          <li>
            <Link to="/#">Analyze</Link>
          </li>
        </ul>

        <AccountDropDown mini />

      </header>
    );
  }
}

export default withRouter(Header);
