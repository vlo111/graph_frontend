import { define } from '../../helpers/redux-request';
import Api from '../../Api';
import ChartUtils from '../../helpers/ChartUtils';

export const CREATE_LABELS = define('CREATE_LABELS');

export function createLabelsRequest(graphId, labels) {
  return CREATE_LABELS.request(() => Api.createLabels(graphId, ChartUtils.objectAndProto(labels)));
}

export const UPDATE_LABELS = define('UPDATE_LABELS');

export function updateLabelsRequest(graphId, labels) {
  return UPDATE_LABELS.request(() => Api.updateLabels(graphId, ChartUtils.objectAndProto(labels)));
}

export const DELETE_LABELS = define('DELETE_LABELS');

export function deleteLabelsRequest(graphId, labels) {
  return DELETE_LABELS.request(() => Api.deleteLabels(graphId, labels));
}
