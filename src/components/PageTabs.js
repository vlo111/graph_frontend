import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import Button from './form/Button';

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
    this.props.history.push(tab.to);
    if (this.props.onChange) {
      this.props.onChange(tab);
    }
  }

  render() {
    const {
      children, tabs, location, history, match, className, direction, ...props
    } = this.props;
    const tab = tabs.find((t) => t.to === location.pathname);
    const list = direction === 'vertical' ? _.reverse([...tabs]) : tabs;
    return (
      <div id="verticalTabs" className={`${direction} ${className}`} {...props}>
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
