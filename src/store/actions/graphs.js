import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const CONVERT_GRAPH = define('CONVERT_GRAPH');

export function convertGraphRequest(type, requestData) {
  return CONVERT_GRAPH.request(() => Api.convert(type, requestData));
}

export const CREATE_GRAPH = define('CREATE_GRAPH');

export function createGraphRequest(requestData) {
  return CREATE_GRAPH.request(() => Api.createGraph(requestData));
}

export const UPDATE_GRAPH = define('UPDATE_GRAPH');

export function updateGraphRequest(id, requestData) {
  return UPDATE_GRAPH.request(() => Api.updateGraph(id, requestData));
}


export const GET_GRAPHS_LIST = define('GET_GRAPHS_LIST');

export function getGraphsListRequest(page = 1, requestData = {}) {
  return GET_GRAPHS_LIST.request(() => Api.getGraphsList(page, requestData)).takeLatest();
}

export const GET_SINGLE_GRAPH = define('GET_SINGLE_GRAPH');

export function getSingleGraphRequest(grhapId) {
  return GET_SINGLE_GRAPH.request(() => Api.getSingleGraph(grhapId));
}
