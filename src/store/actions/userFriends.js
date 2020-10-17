
import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const ADD_FRIEND = define('ADD_FRIEND');

export function AddFriendRequest(requestData) {
  return ADD_FRIEND.request(() => Api.addFriend(requestData), {}, true);
}