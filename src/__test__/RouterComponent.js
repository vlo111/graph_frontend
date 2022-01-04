import {
  Link, Route, Switch, withRouter,
} from 'react-router-dom';
import React from 'react';
import SignIn from '../pages/sign/SignIn';
import SignUp from '../pages/sign/SignUp';
import UserConfirmation from '../pages/sign/UserConfirmation';
import Index from '../pages';

const LocationDisplay = withRouter(({ location }) => (
  <div data-testid="location-display">{location.pathname}</div>
));

export default () => (
  <>
      <nav data-testid="navbar">
        <Link data-testid="home-link" to="/">Home vlo</Link>
        <Link data-testid="signIn-link" to="/sign/sign-in" />
        <Link data-testid="signUp-link" to="/sign/sign-up" />
      </nav>
      <Switch>
        <Route path="/sign/sign-in" component={SignIn} />
        <Route path="/sign/sign-up" component={SignUp} />
        <Route path="/sign/confirmation/:token" component={UserConfirmation} />
        <Route exact path="/" component={Index} />
      </Switch>

      <LocationDisplay />
  </>
);
