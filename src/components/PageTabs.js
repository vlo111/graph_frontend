import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
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
    if (this.props.onChange) {
      this.props.onChange(tab);
    } else {
      this.props.history.push(tab.to);
    }
  }

  render() {
    const {
      children, tabs, location, history, match, myAccount, className, direction, ...props
    } = this.props;
   
    const tab = tabs.find((t) => t.to === location.pathname);
    const list = direction === 'vertical' ? _.reverse([...tabs]) : tabs;

    const checkHomeTabs = !!((
      tab.name === 'Home'
        || tab.name === 'Friends'
        || tab.name === 'Shared Graphs'
        || tab.name === 'Templates'));

    return (
    // <div id="verticalTabs" className={`${direction} ${className}`} {...props}>
      <div className={checkHomeTabs ? 'homePageTabs' : 'verticalTabs'} {...props}>
        {checkHomeTabs ? (
          <div className="userPanel">
            <img src={myAccount.avatar} alt="" />
            <h4>
              {myAccount.firstName}
              {' '}
              {myAccount.lastName}
            </h4>
            <a href={myAccount.website} target="_blank">{myAccount.website}</a>
            <p>
              {myAccount.firstName}
              {' '}
              {myAccount.bio}
            </p>
          </div>
        ) : <div />}
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

// export default withRouter(PageTabs);

const mapStateToProps = (state) => ({
  myAccount: state.account.myAccount,
});

const mapDispatchToProps = {
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PageTabs);

export default withRouter(Container);
