import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class UserData extends Component {
  render() {
    const { myAccount } = this.props;

    return (
      <>
        <div className="userPanel">
          <img src={myAccount.avatar} alt="" />
          <h4>
            {' '}
            {`${myAccount.firstName} ${myAccount.lastName}`}
          </h4>
          <a href={myAccount.website} target="_blank">{myAccount.website}</a>
          <p>{myAccount.bio}</p>
        </div>
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
