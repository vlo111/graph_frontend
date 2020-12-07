import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'; 

class UserData extends Component {
  static propTypes = {
    tabs: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired, 
  }  

  render() {
    const { tabs, myAccount, location } = this.props;
    const tab = tabs.find((t) => t.to === location.pathname);

    const checkHomeTabs = !!((
      tab.name === 'Home'
      || tab.name === 'Friends'
      || tab.name === 'Shared Graphs'
      || tab.name === 'Templates'));

    return (
      <>
        {checkHomeTabs ? (
          <div className="userPanel">
            <img src={myAccount.avatar} alt="" />
            <h4> {`${myAccount.firstName} ${myAccount.lastName}`}
            </h4>
            <a href={myAccount.website} target="_blank">{myAccount.website}</a>
            <p>{myAccount.bio}</p>
          </div>
        ) :' '}
      </>
    );
  }
} 

const mapStateToProps = (state) => ({
  myAccount: state.account.myAccount,
});

const mapDispatchToProps = {
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserData);

export default withRouter(Container);
