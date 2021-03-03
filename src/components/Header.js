import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Notification from './Notification';
import AccountDropDown from './account/AccountDropDown';
import SearchGraphs from './search/SearchGraphs';
import { ReactComponent as LogoSvg } from '../assets/images/logo.svg';
import Button from './form/Button';

class Header extends Component {
  startGraph = () => {
    window.location.href = '/graphs/create';
  }
  compareGraph = () => {
    window.location.href = '/graphs/compare';
  }

  render() {
    return (
      <header className="headerPanel" id="header">
        <div className="logo-graphs">
          <Link to="/">
            <LogoSvg className="logo orange" />
          </Link>
        </div>
        <SearchGraphs />
        <div className="start-graphs">
          <div className="buttonsWrapper">
            <Button color="accent" onClick={this.startGraph}>
              Start a graph  llll
            </Button>
          
              <Button color="accent" onClick={this.compareGraph}>
                Compare graphs
              </Button>
            
          </div>
        </div>
        <div className="right-elements">
          <Notification />
        </div>
        <div className="signOut">
          <AccountDropDown />
        </div>
      </header>
    );
  }
}

export default Header;
