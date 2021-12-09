import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { Route, Switch } from 'react-router-dom';
import renderer from 'react-test-renderer';
// import { act } from 'react-dom/test-utils';
import renderWithReduxNRouter from '../render';
import SignUp from '../../pages/sign/SignUp';
import { ReactComponent as EyeSvg } from '../../assets/images/icons/eye.svg';
import { ReactComponent as LogoSvg } from '../../assets/images/araks_logo.svg';
import Button from '../../components/form/Button';

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
    const { getByTestId } = renderWithReduxNRouter(<RouterComponent />,
      {
        route: '/sign/sign-up',
      });

    expect(getByTestId('sign-up')).toBeInTheDocument();
  });

  /**
 * snapshots sign up elements
 * check social media block
 * check logo with form fields
 */
  describe('html elements displayed correctly', () => {
    it('should be match start button', () => {
    /**
     * match start button
     * @type {*|{children: *, type: *, props: {}|{}}}
     */
      const SignupBtn = renderer.create(
        <Button className="ghButton submit orange ">Start</Button>,
      ).toJSON();
      expect(SignupBtn).toMatchSnapshot();

      /**
       * match first name input
       * @type {*|{children: *, type: *, props: {}|{}}}
       */
      const firstName = renderer.create(
        <div className="ghFormField ghInput">
          <input placeholder="First Name" />
        </div>,
      ).toJSON();
      expect(firstName).toMatchSnapshot();

      /**
       * match last name input
       * @type {*|{children: *, type: *, props: {}|{}}}
       */
      const lastName = renderer.create(
        <div className="ghFormField ghInput">
          <input placeholder="Last Name" />
        </div>,
      ).toJSON();
      expect(lastName).toMatchSnapshot();

      /**
     * match email input
     * @type {*|{children: *, type: *, props: {}|{}}}
     */
      const email = renderer.create(
        <div className="ghFormField ghInput">
          <input placeholder="E-mail" />
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
     * match password input
     * @type {*|{children: *, type: *, props: {}|{}}}
     */
      const passwordConfirn = renderer.create(
        <div className="ghFormFieldPassword    ghFormField ghInput">
          <span className="icon ">
            <EyeSvg
              width={14}
            />
          </span>
          <input placeholder="Confirm password" type="passwordConfirm" />
        </div>,
      ).toJSON();

      expect(passwordConfirn).toMatchSnapshot();
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
 * test create node modal
 * check the advanced form
 */
  describe('check sign up dom elements', () => {
    it('should be the text elements', () => {
      const { getByTestId, getByText } = renderWithReduxNRouter(<RouterComponent />,
        {
          route: '/sign/sign-up',
        });
      /**
     * should be sign in using social media header
     */
      expect(getByText('Sign in using')).toBeInTheDocument();
      /**
     * should be sign in using social media header
     */
      expect(getByText('Get started now')).toBeInTheDocument();
      /**
      * should be firstName input field
      */
      expect(getByTestId('firstName')).toBeInTheDocument();
      /**
      * should be lastName input field
      */
      expect(getByTestId('lastName')).toBeInTheDocument();
      /**
     * should be email input field
     */
      expect(getByTestId('email')).toBeInTheDocument();
      /**
      * should be password input field
      */
      expect(getByTestId('password')).toBeInTheDocument();

      /**
      * should be CpasswordConfirn input field
      */
      expect(getByTestId('passwordConfirn')).toBeInTheDocument();
    });
  });
});
