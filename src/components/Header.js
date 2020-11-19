import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Notification from './Notification';
import AccountDropDown from './account/AccountDropDown';
import SearchGraphs from './search/SearchGraphs';

class Header extends Component {
  render() {
    return (
      <header id="header">
        <div className="logo-graphs">
          <Link to="/">
            <h3> graphs analysed </h3>
          </Link>
        </div>
        <div className="start-graphs">
          <Link to="/graphs/create" style={{ marginLeft: 65 }}>
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
