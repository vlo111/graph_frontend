import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import _ from "lodash";
import Button from "./form/Button";

class VerticalTabs extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    tabs: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
    }
  }

  setActiveTab = (index) => {
    this.setState({ index })
  }


  render() {
    const { index } = this.state;
    const { children, tabs } = this.props;
    return (
      <div id="verticalTabs">
        <ul className="tabsList">
          {_.reverse(tabs).map((tab, i) => (
            <li key={tab} className={`item ${tabs.length - i - 1 === index ? 'active' : ''}`}>
              <Button onClick={() => this.setActiveTab(tabs.length - i - 1)}>{tab}</Button>
            </li>
          ))}
        </ul>
        <div className="content">
          {Children.toArray(children)[index]}
        </div>
      </div>
    );
  }
}

export default VerticalTabs;
