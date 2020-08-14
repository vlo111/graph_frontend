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
import GraphDrafts from './pages/profile/GraphDrafts';
import GraphTemplates from './pages/profile/GraphTemplates';

class App extends Component {
  render() {
    return (
      <>
        <BrowserRouter>
          <Switch>
            <Route path="/drifts" exact component={GraphDrafts} />
            <Route path="/templates" exact component={GraphTemplates} />

            <Route path="/graphs/view/:graphId" component={GraphView} />
            <Route path="/graphs/preview/:graphId" component={GraphView} />
            <Route path="/graphs/filter/:graphId" component={GraphView} />
            <Route path="/graphs/create" component={GraphForm} />
            <Route path="/graphs/update/:graphId" component={GraphForm} />

            <Route path="/graphs/author/:authorId" component={GraphForm} />

            <Route path="/sign/sign-in" component={SignIn} />
            <Route path="/sign/sign-up" component={SignUp} />
            <Route path="/sign/sign-out" component={SignOut} />
            <Route path="/sign/forgot-password" component={SignIn} />
            <Route path="/sign/reset-password" component={SignIn} />

            <Route path="/" component={Home} />
          </Switch>
        </BrowserRouter>
        <ToastContainer hideProgressBar transition={ToastSlide} autoClose={3000} pauseOnFocusLoss={false} />
      </>
    );
  }
}

export default hot(App);
