import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const GET_FRIENDS = define('GET_FRIENDS');

export function getFriendsRequest() {
  return GET_FRIENDS.request(() => Api.getFriends()).takeLatest();
}

export const ADD_FRIEND = define('ADD_FRIEND');

export function AddFriendRequest(requestData) {
  return ADD_FRIEND.request(() => Api.addFriend(requestData), {}, true);
}

export const CANCEL_FRIEND = define('CANCEL_FRIEND');

export function cancelFriendRequest(requestData) {
  return CANCEL_FRIEND.request(() => Api.cancelFriend(requestData), {}, true);
}

export const REJECT_FRIEND = define('REJECT_FRIEND');

export function rejectFriendRequest(requestData) {
  return REJECT_FRIEND.request(() => Api.rejectFriend(requestData), {}, true);
}

export const REMOVE_FRIEND = define('REMOVE_FRIEND');

export function removeFriendRequest(requestData) {
  return REMOVE_FRIEND.request(() => Api.removeFriend(requestData), {}, true);
}
