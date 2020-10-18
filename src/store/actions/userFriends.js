
import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const ADD_FRIEND = define('ADD_FRIEND');

export function AddFriendRequest(requestData) {
  return ADD_FRIEND.request(() => Api.addFriend(requestData), {}, true);
}

export const CANCEL_FRIEND = define('CANCEL_FRIEND');

export function cancelFriendRequest(requestData) {
  return CANCEL_FRIEND.request(() => Api.cancelFriend(requestData), {}, true);
}

export const REMOVE_FRIEND = define('REMOVE_FRIEND');

export function removeFriendRequest(requestData) {
  return REMOVE_FRIEND.request(() => Api.removeFriend(requestData), {}, true);
}