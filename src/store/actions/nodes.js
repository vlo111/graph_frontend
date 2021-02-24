import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const CREATE_NODE = define('CREATE_NODE');

export function createNodeRequest(graphId, node) {
  return CREATE_NODE.request(() => Api.createNode(graphId, node));
}

export const UPDATE_NODE = define('UPDATE_NODE');

export function updateNodeRequest(graphId, nodeId, node) {
  return UPDATE_NODE.request(() => Api.updateNode(graphId, nodeId, node));
}

export const DELETE_NODE = define('DELETE_NODE');

export function deleteNodeRequest(graphId, nodeId) {
  return DELETE_NODE.request(() => Api.deleteNode(graphId, nodeId));
}
