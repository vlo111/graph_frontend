import React, { Component } from 'react';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import Profile from './Profile';

class Account extends Component {
  render() {
    return (
      <Wrapper>
        <Header />
        <Profile/>
      </Wrapper>
    );
  }
}

export default Account;
