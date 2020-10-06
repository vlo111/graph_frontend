import React, { Component } from 'react';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import VerticalTabs from '../../components/VerticalTabs';

class Account extends Component {
  render() {
    return (
      <Wrapper className="account">
        <Header />
        <VerticalTabs tabs={['Profile', 'Settings']}>
          <div>
            a
          </div>
          <div>
            b
          </div>
        </VerticalTabs>
      </Wrapper>
    );
  }
}

export default Account;
