import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Notification from './Notification';
import Button from '../components/form/Button'; 
import AccountDropDown from './account/AccountDropDown';

class Header extends Component {
  render() {
    return (
      <header id="header">
        <div className="logo-graphs">
         <h3>graphs analysed</h3> 
          
        </div>
        <div className="start-graphs">
        <Link to="/graphs/create" style={{ marginLeft: 65 }}>
            <Button icon="fa-pencil" className=" edit">Start a Graphs</Button>
          </Link>
        </div>
        <div className="right-elements">
          <Notification />
          <div  className="signOut">
            <AccountDropDown />
  
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
