import SignIn from '../../pages/sign/SignIn';
import renderWithReduxNRouter from '../render';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent } from '@testing-library/react';

/**
 * Mock google api
 * Initial google api for get access token
 */
beforeEach(() => {
  // setup a DOM element as a render target
  const { REACT_APP_GOOGLE_CLIENT_ID } = process.env;

  const { gapi } = window;

  // gapi.load('auth2', () => {
  //   const auth = gapi.auth2.init({
  //     client_id: REACT_APP_GOOGLE_CLIENT_ID,
  //     cookiepolicy: 'single_host_origin',
  //   });
  //   auth.attachClickHandler({}, {}, (googleUser) => {
  //     const { wc: { access_token: accessToken } } = googleUser;
  //     if (!accessToken) {
  //       // error
  //       return;
  //     }
  //     this.props.oAuthRequest('google', { accessToken });
  //   }, (error) => {
  //     if (error.error !== 'popup_closed_by_user') {
  //       // error ${error.error}
  //     }
  //   });
  // });
});

/**
 * test sign in page
 * check social media buttons
 */
describe('check social media action', () => {
  it('check all logins social networks', () => {
    const { getByTestId } = renderWithReduxNRouter(SignIn);

    /**
     * get token after click google from social media
     */
    fireEvent.click(getByTestId('google'));

  });
});

/**
 * test sign in page
 * check text dom elements with buttons
 * check social media buttons
 */
describe('check sign in dom elements', () => {
  it('should be the text elements', () => {
    const { getByText, getByTestId } = renderWithReduxNRouter(SignIn);

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
