import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import {
  Route, Router, Switch, useHistory,
} from 'react-router-dom';
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { createMemoryHistory } from 'history';
import {
  MemoryRouter,
} from 'react-router';
import SignIn from '../../pages/sign/SignIn';
import SignUp from '../../pages/sign/SignUp';
import render from '../wrapper';
import signUp from '../__mocks__/signUp';
import signIn from '../__mocks__/signIn';
import Index from '../../pages';
import UserConfirmation from '../../pages/sign/UserConfirmation';

configure({ adapter: new Adapter() });

const history = createMemoryHistory();

const RouterComponent = () => (
  <>
    <MemoryRouter>
      <Switch>
        <Route path="/sign/sign-in" component={SignIn} />
        <Route path="/sign/sign-up" component={SignUp} />
        <Route path="/sign/confirmation/:token" component={UserConfirmation} />
        <Route path="/" component={Index} />
      </Switch>
    </MemoryRouter>
  </>
);

/**
 * test create node form
 * add node modal
 */
describe('create node', () => {
  let wrapper;

  beforeAll(async () => {
    // create user with active status
    console.log('1')
    wrapper = render(<RouterComponent />);

    const getFields = () => wrapper.find('input');
    //
    // const { user } = await signUp();
    //
    const event = [
      { target: { name: 'email', value: 'fffawaf@test.com' } },
      { target: { name: 'password', value: 'Test_test1' } },
    ];

    const onChangeEvent = (e, index) => e.simulate('change', event[index]);

    getFields().forEach((p, i) => {
      onChangeEvent(p, i);
    });

    const send = wrapper.find('.ghButton');
    console.log('2')

    const val = await send.simulate('submit');

    // history.replace('/sign/sign-up');
    //
    // wrapper.update();
    //
    // console.log(wrapper.debug());

    // const getFields = () => wrapper.find('input');
    //
    // const onChangeEvent = (e, index) => e.simulate('change', event[index]);
    //
    // expect(getFields().length).toBe(5);
    //
    // const event = [
    //   { target: { name: 'firstName', value: 'testf' } },
    //   { target: { name: 'lastName', value: 'testl' } },
    //   { target: { name: 'email', value: 'test@email.com' } },
    //   { target: { name: 'password', value: '111111aA' } },
    //   { target: { name: 'passwordConfirm', value: '111111aA' } },
    // ];
    //
    // getFields().forEach((p, i) => {
    //   onChangeEvent(p, i);
    // });
    //
    // const send = wrapper.find('form');
    //
    // send.simulate('submit');
    //
    // history.replace('/sign/sign-in');
    //
    // wrapper.update();
    //
    // console.log(wrapper.debug());
    //
    // console.log(wrapper.find('input').at(0).debug())
    //
    // wrapper.find('input').at(0).simulate('change', { target: { name: 'emaill', value: 'test@email.com' } });
    //
    // wrapper.find('input').at(1).simulate('change', { target: { name: 'passwordl', value: '111111aA' } });
    // //
    // // wrapper.find('.input_2').simulate('change', { target: { name: 'password', value: '111111aA' } });
    // //
    // wrapper.find('.submit').simulate('click');
    //
    // wrapper.update();
    //
    // console.log(wrapper.debug());

    // const secretKey = 'wr4-)*&&zg23jk5vn)';
    //
    // const token = jwt.sign(
    //   {
    //     user: _.pick(user, 'id'),
    //   },
    //   secretKey,
    //   {
    //     expiresIn: '1d',
    //   },
    // );
    //
    // history.replace(`/sign/confirmation/${token}`);
    //
    // wrapper.update();
    //
    // history.replace('/');
    //
    // wrapper.update();
    //
    // console.log(wrapper.debug());

    // wrapper = render(<RouterComponent />,
    //   {
    //     route: `/sign/confirmation/${token}`,
    //   });
    //
    // if (user) {
    //   /**
    //    * sign in with the same user
    //    */
    //   await signIn(user.email, password);
    // }

    // mockHistoryPush(`/sign/confirmation/${token}`);
  });

  it('should be open add node modal mode from tool bar menu', () => {
    // expect(wrapper.text().includes('You have no graph yet')).toBe(true);
    // console.log(history);
    // history.push('/');
    // wrapper.update();
    // console.log(history);
    // console.log(wrapper.debug())
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
