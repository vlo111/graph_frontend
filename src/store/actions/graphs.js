import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const CONVERT_GRAPH = define('CONVERT_GRAPH');

export function convertGraphRequest(type, requestData) {
  return CONVERT_GRAPH.request(() => Api.convertToGraph(type, requestData));
}

export const CONVERT_NODE_GRAPH = define('CONVERT_NODE_GRAPH');

export function convertNodeRequest(type, requestData) {
  return CONVERT_NODE_GRAPH.request(() => Api.convertToNode(type, requestData));
}

export const CREATE_GRAPH = define('CREATE_GRAPH');

export function createGraphRequest(requestData) {
  return CREATE_GRAPH.request(() => Api.createGraph(requestData));
}

export const UPDATE_GRAPH = define('UPDATE_GRAPH');

export function updateGraphRequest(id, requestData) {
  return UPDATE_GRAPH.request(() => Api.updateGraph(id, requestData));
}

export const DELETE_GRAPH = define('DELETE_GRAPH');

export function deleteGraphRequest(id) {
  return DELETE_GRAPH.request(() => Api.deleteGraph(id));
}

export const UPDATE_GRAPH_THUMBNAIL = define('UPDATE_GRAPH_THUMBNAIL');

export function updateGraphThumbnailRequest(id, svg) {
  return UPDATE_GRAPH_THUMBNAIL.request(() => Api.updateGraphThumbnail(id, svg));
}

export const GET_GRAPHS_LIST = define('GET_GRAPHS_LIST');

export function getGraphsListRequest(page = 1, requestData = {}) {
  return GET_GRAPHS_LIST.request(() => Api.getGraphsList(page, requestData)).takeLatest();
}

export const GET_SINGLE_GRAPH = define('GET_SINGLE_GRAPH');

export function getSingleGraphRequest(graphId) {
  return GET_SINGLE_GRAPH.request(() => Api.getSingleGraph(graphId));
}

export const CLEAR_SINGLE_GRAPH = 'CLEAR_SINGLE_GRAPH';

export const UPDATE_SINGLE_GRAPH = 'UPDATE_SINGLE_GRAPH';

export function clearSingleGraph() {
  return {
    type: CLEAR_SINGLE_GRAPH,
    payload: {},
  };
}

export function updateSingleGraph(graph) {
  return {
    type: UPDATE_SINGLE_GRAPH,
    payload: graph,
  };
}

export const SET_NODE_CUSTOM_FIELD = 'SET_NODE_CUSTOM_FIELD';

export function setNodeCustomField(type, name, customField, tabData) {
  return {
    type: SET_NODE_CUSTOM_FIELD,
    payload: { type, name, customField, tabData },
  };
}

export const ADD_NODE_CUSTOM_FIELD_KEY = 'ADD_NODE_CUSTOM_FIELD_KEY';

export function addNodeCustomFieldKey(type, key, subtitle) {
  return {
    type: ADD_NODE_CUSTOM_FIELD_KEY,
    payload: { type, key, subtitle },
  };
}

export const REMOVE_NODE_CUSTOM_FIELD_KEY = 'REMOVE_NODE_CUSTOM_FIELD_KEY';

export function removeNodeCustomFieldKey(type, key) {
  return {
    type: REMOVE_NODE_CUSTOM_FIELD_KEY,
    payload: { type, key },
  };
}

export const ACTIONS_COUNT = define('ACTIONS_COUNT');

export function getActionsCountRequest(id) {
  return ACTIONS_COUNT.request(() => Api.getActionsCount(id));
}
