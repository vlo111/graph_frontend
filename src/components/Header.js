import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import Notification from './Notification';
import AccountDropDown from './account/AccountDropDown';
import SearchGraphs from './search/SearchGraphs';
import { ReactComponent as LogoSvg } from '../assets/images/logo.svg';
import { ReactComponent as NotifySvg } from '../assets/images/icons/notification.svg';
import { ReactComponent as HelpSvg } from '../assets/images/icons/help.svg';
import { ReactComponent as NotifyEmptySvg } from '../assets/images/icons/notificationComplete.svg';
import Button from './form/Button';
import Helps from './Helps/index';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDropDown: false,

    };
  }

  toggleDropDown = () => {
    const { showDropDown } = this.state;

    this.setState({ showDropDown: !showDropDown });
  }

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
        if (dataCount === 0) {
          notifyElement.innerHTML = ReactDOMServer.renderToString(<NotifyEmptySvg />);
        } else {
          notifyElement.innerHTML = ReactDOMServer.renderToString(<NotifySvg />);
        }
      }
    }, 100);
  }

  render() {
    const { showDropDown } = this.state;
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
            <Button className="btn-classic" onClick={this.startGraph}>
              Create a Graph
            </Button>

            <Button className="btn-classic__alt" onClick={this.compareGraph}>
              Compare Graphs
            </Button>

          </div>
        </div>
        <div className="notify_container">
          <div className="notificationHeader">
            <Notification />
          </div>
        </div>
        <div className="headerHelp">
          <Button
            icon={<HelpSvg />}
            onClick={this.toggleDropDown}
          />
        </div>
        {showDropDown ? (
          <div className="helpsOutside">
            <Helps closeModal={this.toggleDropDown} />
          </div>
        ) : null}
        <div className="signOut">
          <AccountDropDown />
        </div>
      </header>
    );
  }
}

export default Header;
