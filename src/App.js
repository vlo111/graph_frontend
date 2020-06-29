import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import GraphForm from './pages/GraphForm';
import SignIn from './pages/sign/SignIn';
import SignUp from './pages/sign/SignUp';
import Home from './pages/Home';
import GraphView from './pages/GraphView';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/graphs/view/:graphId" component={GraphView} />
          <Route path="/graphs/create" component={GraphForm} />
          <Route path="/graphs/update/:graphId" component={GraphForm} />

          <Route path="/graphs/author/:authorId" component={GraphForm} />

          <Route path="/sign/sign-in" component={SignIn} />
          {/*<Route path="/sign/sign-up" component={SignUp} />*/}
          <Route path="/sign/forgot-password" component={SignIn} />
          <Route path="/sign/reset-password" component={SignIn} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default hot(App);
