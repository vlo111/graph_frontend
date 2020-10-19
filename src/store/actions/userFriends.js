
import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const ADD_FRIEND = define('ADD_FRIEND');

export function AddFriendRequest(requestData) {
  return ADD_FRIEND.request(() => Api.addFriend(requestData), {}, true);
}

export const CANCEL_FRIEND = define('CANCEL_FRIEND');

export function cancelFriendRequest(requestData, id) {
  return CANCEL_FRIEND.request(() => Api.cancelFriend(requestData, id), {}, true);
}

export const ACCEPT_FRIEND = define('ACCEPT_FRIEND');

export function acceptFriendRequest(requestData, id) {
  return ACCEPT_FRIEND.request(() => Api.acceptFriend(requestData, id), {}, true);
}

export const REMOVE_FRIEND = define('REMOVE_FRIEND');

export function removeFriendRequest(id) {
  return REMOVE_FRIEND.request(() => Api.removeFriend(id), {}, true);
}

export const MY_FRIENDS = define('MY_FRIENDS');

export function myFriendsRequest() {
  return MY_FRIENDS.request(() => Api.myFriends());
}