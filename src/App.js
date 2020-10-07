import React, { Component } from 'react';
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
import Utils from './helpers/Utils';
import ForgotPassword from './pages/sign/ForgotPassword';
import ResetPassword from './pages/sign/ResetPassword';
import OAuth from './pages/sign/OAuth';
import Shared from './pages/Shared';
import Index from './pages/Index';
import Account from "./pages/profile/Account";

class App extends Component {
  componentDidMount() {
    document.body.classList.add(`${Utils.getOS()}_${Utils.getBrowser()}`);
  }

  render() {
    return (
      <>
        <BrowserRouter>
          <Switch>
            <Route path="/drifts" exact component={GraphDrafts} />
            <Route path="/templates" exact component={Index} />
            <Route path="/shared" exact component={Index} />

            <Route path="/graphs/view/:graphId" component={GraphView} />
            <Route path="/graphs/preview/:graphId" component={GraphView} />
            <Route path="/graphs/filter/:graphId" component={GraphView} />
            <Route path="/graphs/create" component={GraphForm} />
            <Route path="/graphs/shared" component={Shared} />
            <Route path="/graphs/update/:graphId" component={GraphForm} />
            <Route path="/graphs/author/:authorId" component={GraphForm} />

            <Route path="/account" component={Account} />

            <Route path="/sign/sign-in" component={SignIn} />
            <Route path="/sign/sign-up" component={SignUp} />
            <Route path="/sign/sign-out" component={SignOut} />
            <Route path="/sign/forgot-password" component={ForgotPassword} />
            <Route path="/sign/reset-password" component={ResetPassword} />
            <Route path="/sign/oauth/:type" component={OAuth} />

            <Route path="/" component={Index} />
          </Switch>
        </BrowserRouter>
        <ToastContainer hideProgressBar transition={ToastSlide} autoClose={3000} pauseOnFocusLoss={false} />
      </>
    );
  }
}

export default App;
