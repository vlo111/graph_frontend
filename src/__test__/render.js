import { cleanup, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import React from 'react';
import store from '../store';
import Index from '../pages';

afterEach(cleanup);

/**
 * this is a handy function that we normally make available for all tests
 * that deal with connected components.
 * we can provide the entire store that the component is rendered with
 * @param component
 */
const renderWithRedux = (
    component,
) => ({
    ...render(
        <Provider store={store}>
            <BrowserRouter>
                <Switch>
                    <Route path="/sign/sign-in" component={component} />
                    <Route path="/" component={Index} />
                </Switch>
            </BrowserRouter>
        </Provider>,
    ),
});

export default renderWithRedux;