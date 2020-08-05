import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ToastContainer, Slide as ToastSlide } from 'react-toastify';
import GraphForm from './pages/GraphForm';
import SignIn from './pages/sign/SignIn';
import SignUp from './pages/sign/SignUp';
import Home from './pages/Home';
import GraphView from './pages/GraphView';
import SignOut from './pages/sign/SignOut';

class App extends Component {
  render() {
    return (
      <>
        <BrowserRouter>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/graphs/view/:graphId" component={GraphView} />
            <Route path="/graphs/create" component={GraphForm} />
            <Route path="/graphs/update/:graphId" component={GraphForm} />

            <Route path="/graphs/author/:authorId" component={GraphForm} />

            <Route path="/sign/sign-in" component={SignIn} />
            <Route path="/sign/sign-up" component={SignUp} />
            <Route path="/sign/sign-out" component={SignOut} />
            <Route path="/sign/forgot-password" component={SignIn} />
            <Route path="/sign/reset-password" component={SignIn} />
          </Switch>
        </BrowserRouter>
        <ToastContainer hideProgressBar transition={ToastSlide} autoClose={3000} />
      </>
    );
  }
}

export default hot(App);
