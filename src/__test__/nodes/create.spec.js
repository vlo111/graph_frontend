import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import renderWithReduxNRouter from '../render';
import GraphForm from '../../pages/GraphForm';

const RouterComponent = () => (
  <>
    <Switch>
      <Route path="/graphs/update/:graphId" component={GraphForm} />
    </Switch>
  </>
);

/**
 * test sign up page
 */
describe('sign up', () => {
  it('sign up', () => {
    const { container, getByTestId } = renderWithReduxNRouter(<RouterComponent />,
      {
        route: '/graphs/update/1',
      });

    expect(getByTestId('node')).toBeInTheDocument();
  });
});
