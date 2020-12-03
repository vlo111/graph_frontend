import React, { Component } from 'react';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import VerticalTabs from '../../components/PageTabs';
import Profile from './Profile';

class Account extends Component {
  render() {
    return (
      <Wrapper className="account">
        <Header />

        <VerticalTabs
          tabs={[
            { to: '/account', name: 'Profile', component: <Profile /> },
            {
              to: '/account/settings',
              name: 'Settings',
              component: (
                <div>
                  Settings
                </div>
              ),
            },
          ]}
        />
      </Wrapper>
    );
  }
}

export default Account;
