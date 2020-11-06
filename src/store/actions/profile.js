import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const GET_PROFILE = define('GET_PROFILE');

export function getUserRequest(userId) {
  return GET_PROFILE.request(() => Api.getUser(userId));
}
