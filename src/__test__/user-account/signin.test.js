import SignIn from '../../pages/sign/SignIn';
import renderWithRedux from '../render';
import '@testing-library/jest-dom/extend-expect';

/**
 * test sign in page
 * check text dom elements with buttons
 * check social media buttons
 */
describe('check sign in dom elements', () => {
  it('should be the text elements', () => {
    const { getByText, getByTestId } = renderWithRedux(SignIn);

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
  });
});
