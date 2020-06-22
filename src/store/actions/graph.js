import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const CONVERT_GRAPH = define('CONVERT_GRAPH');

export function convertGraphRequest(type, requestData) {
  return CONVERT_GRAPH.request(() => Api.convert(type, requestData));
}
