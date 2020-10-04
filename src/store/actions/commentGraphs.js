import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const CREATE_COMMENT_GRAPH = define('CREATE_COMMENT_GRAPH');

export function createGraphCommentRequest(requestData) {
  return CREATE_COMMENT_GRAPH.request(() => Api.createCommentGraph(requestData));
}

export const GET_GRAPH_COMMENTS = define('GET_GRAPH_COMMENTS');

export function getGraphCommentsRequest(requestData) {
  return GET_GRAPH_COMMENTS.request(() => Api.graphComments(requestData));
}
