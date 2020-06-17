import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import GraphForm from './pages/GraphForm';
import SignIn from './pages/sign/SignIn';
import SignUp from './pages/sign/SignUp';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={GraphForm} />

          <Route path="/sign/sign-in" component={SignIn} />
          <Route path="/sign/sign-up" component={SignUp} />
          <Route path="/sign/forgot-password" component={SignIn} />
          <Route path="/sign/reset-password" component={SignIn} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default hot(App);
