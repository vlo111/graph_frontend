import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import SignIn from '../../pages/sign/SignIn';
import SignUp from '../../pages/sign/SignUp';
import render from '../wrapper';
import signUp from '../__mocks__/signUp';
import signIn from '../__mocks__/signIn';
import Index from '../../pages';
import UserConfirmation from '../../pages/sign/UserConfirmation';

configure({ adapter: new Adapter() });

const RouterComponent = () => (
  <>
    <Switch>
      <Route path="/sign/sign-in" component={SignIn} />
      <Route path="/sign/sign-up" component={SignUp} />
      <Route path="/sign/confirmation/:token" component={UserConfirmation} />
      <Route path="/" component={Index} />
    </Switch>
  </>
);

/**
 * test create node form
 * add node modal
 */
describe('create node', () => {
  let wrapper;

  beforeAll(async () => {
    /**
     * sign up with mock user
     * @type {{firstName: string, lastName: string, password: string, email: string}|null}
     */
    const user = await signUp();

    const secretKey = 'wr4-)*&&zg23jk5vn)';

    const token = jwt.sign(
      {
        user: _.pick(user, 'id'),
      },
      secretKey,
      {
        expiresIn: '1d',
      },
    );

    wrapper = render(<RouterComponent />,
      {
        route: `/sign/confirmation/${token}`,
      });

    if (user) {
      /**
       * sign in with the same user
       */
      await signIn(user.email, user.password);
    }
  });

  it('should be open add node modal mode from tool bar menu', () => {
    // expect(wrapper.text().includes('You have no graph yet')).toBe(true);
  });

  it('sign up', () => {
  //   const getFields = () => wrapper.find('input');
  //
  //   const onChangeEvent = (e, index) => e.simulate('change', event[index]);
  //
  //   expect(getFields().length).toBe(5);
  //
  //   const event = [
  //     { target: { name: 'firstName', value: 'test_f' } },
  //     { target: { name: 'lastName', value: 'test_l' } },
  //     { target: { name: 'email', value: 'test@email.com' } },
  //     { target: { name: 'password', value: '111111aA' } },
  //     { target: { name: 'passwordConfirm', value: '111111aA' } },
  //   ];
  //
  //   getFields().forEach((p, i) => {
  //     onChangeEvent(p, i);
  //   });
  //
  //   const send = wrapper.find('form');
  //   send.simulate('submit');
  });
});
