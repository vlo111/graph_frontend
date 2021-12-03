import React from 'react';
import { Route, Switch } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { fireEvent } from '@testing-library/react';
import SignIn from '../../pages/sign/SignIn';
import renderWithReduxNRouter from '../render';
import '@testing-library/jest-dom/extend-expect';
import { ReactComponent as EyeSvg } from '../../assets/images/icons/eye.svg';
import { ReactComponent as LogoSvg } from '../../assets/images/araks_logo.svg';

const RouterComponent = () => (
  <>
    <Switch>
      <Route path="/sign/sign-in" component={SignIn} />
    </Switch>
  </>
);

/**
 * Mock google api
 * Initial google api for get access token
 */
// ------------
// ------------

/**
 * test social media api in the page
 * check social media buttons
 */
describe('check social media action', () => {
  it('check all logins social networks', () => {
    const { getByTestId } = renderWithReduxNRouter(<RouterComponent />,
      {
        route: '/sign/sign-in',
      });

    /**
     * get token after click google from social media
     */
    fireEvent.click(getByTestId('google'));
  });
});

/**
 * snapshots sign in elements
 * check social media block
 * check logo with form fields
 */
describe('html elements displayed correctly', () => {
  it('should be match sign in button', () => {
    /**
     * match sign in button
     * @type {*|{children: *, type: *, props: {}|{}}}
     */
    const signinBtn = renderer.create(
      <button className="ghButton submit orange alt">Sign In</button>,
    ).toJSON();
    expect(signinBtn).toMatchSnapshot();

    /**
     * match email input
     * @type {*|{children: *, type: *, props: {}|{}}}
     */
    const email = renderer.create(
      <div className="ghFormField ghInput">
        <input placeholder="Email address" />
      </div>,
    ).toJSON();
    expect(email).toMatchSnapshot();

    /**
     * match password input
     * @type {*|{children: *, type: *, props: {}|{}}}
     */
    const password = renderer.create(
      <div className="ghFormFieldPassword   ghFormField ghInput">
        <span className="icon ">
          <EyeSvg
            width={14}
          />
        </span>
        <input placeholder="Password" type="password" />
      </div>,
    ).toJSON();

    expect(password).toMatchSnapshot();

    /**
     * match forget password field
     * @type {*|{children: *, type: *, props: {}|{}}}
     */
    const forget = renderer.create(
      <a className="forgotPassword">Forgot password?</a>,
    ).toJSON();

    expect(forget).toMatchSnapshot();

    /**
     * match logo
     * @type {*|{children: *, type: *, props: {}|{}}}
     */
    const logo = renderer.create(
      <LogoSvg className="logo white" />,
    ).toJSON();

    expect(logo).toMatchSnapshot();
  });
});

/**
 * test elements exist in sign_in page
 * check text dom elements with buttons
 * check social media buttons
 */
describe('check sign in dom elements', () => {
  it('should be the text elements', () => {
    const { getByTestId, getByText } = renderWithReduxNRouter(<RouterComponent />,
      {
        route: '/sign/sign-in',
      });

    /**
     * should be the forget password text
     */
    expect(getByText('Don\'t have an admin yet?')).toBeInTheDocument();

    /**
     * should be sign in using social media header
     */
    expect(getByText('Sign in using')).toBeInTheDocument();

    /**
     * should be email input field
     */
    expect(getByTestId('email')).toBeInTheDocument();

    /**
     * should be password input field
     */
    expect(getByTestId('password')).toBeInTheDocument();

    /**
     * should be facebook field
     */
    expect(getByTestId('facebook')).toBeInTheDocument();

    /**
     * should be linked In field
     */
    expect(getByTestId('linkedin')).toBeInTheDocument();

    /**
     * should be google field
     */
    expect(getByTestId('google')).toBeInTheDocument();

    /**
     * should be twitter field
     */
    expect(getByTestId('twitter')).toBeInTheDocument();
  });
});
