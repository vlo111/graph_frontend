import React, { Component } from 'react';
import SaveGraph from './chart/SaveGraph';

class Header extends Component {
  render() {
    return (
      <header>
        <SaveGraph />
        <div id="headerPortal" />
      </header>
    );
  }
}

export default Header;
