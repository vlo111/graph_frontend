import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const GET_SHARED_WITH_USERS = define('GET_SHARED_WITH_USERS');

export function getSharedWithUsersRequest(graphId, type = 'graph', objectId) {
  return GET_SHARED_WITH_USERS.request(() => Api.getSharedWithUsers(graphId, type, objectId));
}

export const SHARE_GRAPH_WITH_USERS = define('SHARE_GRAPH');

export function shareGraphWithUsersRequest(params) {
  return SHARE_GRAPH_WITH_USERS.request(() => Api.shareGraphWithUsers(params));
}

export const UPDATE_SHARE_GRAPH_WITH_USERS = define('UPDATE_SHARE_GRAPH_WITH_USERS');

export function updateShareGraphWithUsersRequest(shareId, params) {
  return UPDATE_SHARE_GRAPH_WITH_USERS.request(() => Api.updateShareGraphWithUsers(shareId, params));
}

export function deleteShareGraphWithUsersRequest(shareId) {
  return UPDATE_SHARE_GRAPH_WITH_USERS.request(() => Api.deleteShareGraphWithUsers(shareId));
}
