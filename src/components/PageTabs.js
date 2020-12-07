import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import Button from './form/Button';
import UserData from "../pages/profile/UserData";

class PageTabs extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    tabs: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    direction: PropTypes.oneOf(['vertical', 'horizontal']),
  }

  static defaultProps = {
    onChange: undefined,
    direction: 'vertical',
  }

  setActiveTab = (tab) => {
    if (this.props.onChange) {
      this.props.onChange(tab);
    } else {
      this.props.history.push(tab.to);
    }
  }

  render() {
    const {
      children, tabs, location, history, match, className, direction, ...props
    } = this.props;
    const tab = tabs.find((t) => t.to === location.pathname);
    const list = direction === 'vertical' ? _.reverse([...tabs]) : tabs;
    const isHome = direction === 'vertical' && className === 'homePageTabs';
    return (
        <div id="verticalTabs" className={`${direction} ${!isHome ? className : 'homeWithUser'}`} {...props}>
          { isHome && <UserData />}
          <ul className="tabsList">
            {list.filter((t) => !t.hidden).map((t) => (
                <li key={t.name} className={`item ${t.to === location.pathname ? 'active' : ''}`}>
                  <Button onClick={() => this.setActiveTab(t)}>
                    {t.name}
                  </Button>
                </li>
            ))}
          </ul>
          <div className="content">
            {tab?.component}
          </div>
        </div>
    );
  }
}

export default withRouter(PageTabs);
