import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { fireEvent } from '@testing-library/react';
import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import renderWithReduxNRouter from '../render';
import GraphForm from '../../pages/GraphForm';
import SignIn from '../../pages/sign/SignIn';
import SignUp from '../../pages/sign/SignUp';
import render from '../wrapper';

configure({ adapter: new Adapter() });

const RouterComponent = () => (
  <>
    <Switch>
      <Route path="/sign/sign-in" component={SignIn} />
      <Route path="/sign/sign-up" component={SignUp} />
      <Route path="/graphs/update" component={GraphForm} />
    </Switch>
  </>
);

/**
 * test create node form
 * add node modal
 */
describe('create node', () => {
  beforeAll(() => {
    // const user = jest.fn(() => ({
    //   firstName: 'f_test',
    //   lastName: 'l_test',
    //   email: 'email@test.test',
    //   password: 'Test_test1',
    //   passwordConfirm: 'Test_test1',
    // }));
    //
    // const { getByTestId, container } = renderWithReduxNRouter(<RouterComponent />,
    //   {
    //     route: '/sign/sign-up',
    //   });
    //
    // console.log(container.debug())
    //
    // expect(getByTestId('sign-up')).toBeInTheDocument();
    //
    // const fields = container.querySelectorAll('input');
    //
    // expect(fields.length).toBe(5);
    //
    // const [firstName, lastName, email, password, passwordConfirm] = fields;
    //
    // fireEvent.click((getByTestId('start')));

    const wrapper = render(<RouterComponent />,
      {
        route: '/sign/sign-up',
      });

    console.log(wrapper.debug());

    // expect(wrapper.find('.SigsnUasd as daspLeft')).not.toBeNull();

    // expect(getByTestId('sign-up')).toBeInTheDocument();
  });

  it('sign up', () => {
    // const { container, getByTestId } = renderWithReduxNRouter(<RouterComponent />,
    //   {
    //     route: '/graphs/update',
    //   });
    // const a = container.querySelector('div');

    // expect(getByTestId('email')).toBeInTheDocument();
  });
});
