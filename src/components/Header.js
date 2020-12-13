import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Notification from './Notification';
import AccountDropDown from './account/AccountDropDown';
import SearchGraphs from './search/SearchGraphs';
import { ReactComponent as LogoSvg } from '../assets/images/logo.svg';

class Header extends Component {
  render() {
    return (
      <header id="header">
        <div className="logo-graphs">
          <Link to="/">
          <LogoSvg className="logo orange" />
          </Link>
        </div>
        <SearchGraphs />
        <div className="start-graphs">
          <Link to="/graphs/create">
            Start a graph
          </Link>
        </div>

        <div className="right-elements">
          <Notification />
          <div className="signOut">
           <AccountDropDown />

          </div>
        </div>
      </header>
    );
  }
}

export default Header;
