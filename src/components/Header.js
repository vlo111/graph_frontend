import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Notification from './Notification';

class Header extends Component {
  render() {
    return (
      <header id="header">
        <div>
          <Link className="ghButton" to="/">Home</Link>
          <Link className="ghButton" to="/templates">Templates</Link>
        </div>
        <div className="right-elements">
          <Notification />
          <Link className="ghButton signOut" to="/sign/sign-out">Sign Out</Link>
        </div>
      </header>
    );
  }
}

export default Header;
