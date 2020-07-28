import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {
  render() {
    return (
      <header id="header">
        <div id="headerPortal" />
        <Link className="ghButton signOut" to="/sign/sign-out">Sign Out</Link>
      </header>
    );
  }
}

export default Header;
