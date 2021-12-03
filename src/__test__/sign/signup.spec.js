import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import renderWithReduxNRouter from '../render';
import SignUp from '../../pages/sign/SignUp';

const RouterComponent = () => (
  <>
    <Switch>
      <Route path="/sign/sign-up" component={SignUp} />
    </Switch>
  </>
);

/**
 * test create node modal
 * check the advanced form
 */
describe('', () => {
  it('', () => {
    const { container, getByTestId } = renderWithReduxNRouter(<RouterComponent />,
      {
        route: '/sign/sign-up',
      });

    expect(getByTestId('lola')).toBeInTheDocument();
  });
});
