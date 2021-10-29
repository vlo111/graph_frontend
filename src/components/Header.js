import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import Notification from './Notification';
import AccountDropDown from './account/AccountDropDown';
import SearchGraphs from './search/SearchGraphs';
import { ReactComponent as LogoSvg } from '../assets/images/logo.svg';
import { ReactComponent as NotifySvg } from '../assets/images/icons/notification.svg';
import { ReactComponent as NotifyEmptySvg } from '../assets/images/icons/notificationComplete.svg';

class Header extends Component {
  startGraph = () => {
    window.location.href = '/graphs/create';
  }

  compareGraph = () => {
    window.location.href = '/graphs/compare';
  }

  componentDidMount() {
    const notifyElement = document.querySelector('.notification');

    setTimeout(() => {
      if (notifyElement) {
        const dataCount = notifyElement.getAttribute('data-count');
        if (dataCount == 0) {
          notifyElement.innerHTML = ReactDOMServer.renderToString(<NotifyEmptySvg />);
        } else {
          notifyElement.innerHTML = ReactDOMServer.renderToString(<NotifySvg />);
        }
      }
    }, 100);
  }

  render() {
    return (
      <header className="headerPanel" id="header">
        <div className="logo-graphs">
          <Link to="/">
            <LogoSvg />
          </Link>
        </div>
        <SearchGraphs />
        <div className="start-graphs">
          <div className="buttonsWrapper">
            <button className="btn-classic" onClick={this.startGraph}>
              Start a graph
            </button>

            <button className="btn-classic__alt" onClick={this.compareGraph}>
              Compare graphs
            </button>

          </div>
        </div>
        <div className="notify_container">
          <div className="notificationHeader">
            <Notification />
          </div>
        </div>
        <div className="signOut">
          <AccountDropDown />
        </div>
      </header>
    );
  }
}

export default Header;
