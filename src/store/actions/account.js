import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const SIGN_IN = define('SIGN_IN');

export function signInRequest(email, password) {
  return SIGN_IN.request(() => Api.singIn(email, password));
}

export const SIGN_UP = define('SIGN_UP');

export function signUpRequest(requestData) {
  return SIGN_UP.request(() => Api.singUp(requestData));
}

export const GET_MY_ACCOUNT = define('GET_MY_ACCOUNT');

export function getMyAccountRequest() {
  return GET_MY_ACCOUNT.request(() => Api.getMyAccount());
}
