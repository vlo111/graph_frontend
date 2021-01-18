import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const GET_PICTURES_BY_TAG = define('GET_PICTURES_BY_TAG');

export function getPicturesByTagRequest(tag) {
  return GET_PICTURES_BY_TAG.request(() => Api.getPicturesByTag(tag), {});
}

export const GET_DOCUMENTS_BY_TAG = define('GET_DOCUMENTS_BY_TAG');

export function getDocumentsByTagRequest(tag) {
  return GET_DOCUMENTS_BY_TAG.request(() => Api.getDocumentsByTag(tag), {});
}

export const GET_DOCUMENTS = define('GET_DOCUMENTS');

export function getDocumentsRequest(graphId) {
  return GET_DOCUMENTS.request(() => Api.getDocuments(graphId), {});
}
