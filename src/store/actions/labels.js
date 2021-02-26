import { define } from '../../helpers/redux-request';
import Api from '../../Api';
import ChartUtils from '../../helpers/ChartUtils';

export const CREATE_LABEL = define('CREATE_LABEL');

export function createLabelRequest(graphId, label) {
  return CREATE_LABEL.request(() => Api.createLabel(graphId, ChartUtils.objectAndProto(label)));
}

export const UPDATE_LABEL = define('UPDATE_LABEL');

export function updateLabelRequest(graphId, labelId, label) {
  return UPDATE_LABEL.request(() => Api.updateLabel(graphId, labelId, ChartUtils.objectAndProto(label)));
}

export const DELETE_LABEL = define('DELETE_LABEL');

export function deleteLabelRequest(graphId, labelId) {
  return DELETE_LABEL.request(() => Api.deleteLabel(graphId, labelId));
}
