import { define } from '../../helpers/redux-request';
import Api from '../../Api';
import ChartUtils from '../../helpers/ChartUtils';

export const CREATE_LINK = define('CREATE_LINK');

export function createLinkRequest(graphId, node) {
  return CREATE_LINK.request(() => Api.createLink(graphId, ChartUtils.objectAndProto(node)));
}

export const UPDATE_LINK = define('UPDATE_LINK');

export function updateLinkRequest(graphId, nodeId, node) {
  return UPDATE_LINK.request(() => Api.updateLink(graphId, nodeId, ChartUtils.objectAndProto(node)));
}

export const DELETE_LINK = define('DELETE_LINK');

export function deleteLinkRequest(graphId, nodeId) {
  return DELETE_LINK.request(() => Api.deleteLink(graphId, nodeId));
}
