import _ from 'lodash';
import { toast } from 'react-toastify';
import {
  CLEAR_SINGLE_GRAPH,
  UPDATE_SINGLE_GRAPH,
  CONVERT_GRAPH,
  GET_GRAPHS_LIST,
  GET_SINGLE_GRAPH,
  SET_NODE_CUSTOM_FIELD,
  ADD_NODE_CUSTOM_FIELD_KEY,
  REMOVE_NODE_CUSTOM_FIELD_KEY,
  ACTIONS_COUNT,
  GET_SINGLE_EMBED_GRAPH,
  SET_GRAPH_CUSTOM_FIELDS,
  GET_SINGLE_GRAPH_PREVIEW,
  UPDATE_GRAPH,
  REMOVE_NODE_FROM_CUSTOM_FIELD, RENAME_NODE_CUSTOM_FIELD_KEY,
} from '../actions/graphs';
import CustomFields from '../../helpers/CustomFields';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import { GENERATE_THUMBNAIL_WORKER } from '../actions/socket';

const initialState = {
  importData: {},
  graphsList: [],
  graphsListStatus: '',
  singleGraph: {},
  embedLabels: [],
  graphsListInfo: {
    totalPages: 0,
  },
  actionsCount: {},
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CONVERT_GRAPH.REQUEST: {
      return {
        ...state,
        importData: {},
      };
    }
    case CONVERT_GRAPH.SUCCESS: {
      const { data: importData } = action.payload;
      return {
        ...state,
        importData,
      };
    }
    case GET_GRAPHS_LIST.REQUEST: {
      return {
        ...state,
        graphsListStatus: 'request',
        graphsList: [],
      };
    }
    case GET_GRAPHS_LIST.SUCCESS: {
      const { graphs: graphsList, ...graphsListInfo } = action.payload.data;
      return {
        ...state,
        graphsListStatus: 'success',
        graphsList,
        graphsListInfo,
      };
    }
    case GENERATE_THUMBNAIL_WORKER: {
      const { graph } = action.payload.data;

      const graphsList = [...state.graphsList].map((g) => {
        if (g.id === graph.id) {
          g.updatedAt = graph.updatedAt;
        }
        return g;
      });

      return {
        ...state,
        graphsList,
      };
    }
    case GET_GRAPHS_LIST.FAIL: {
      return {
        ...state,
        graphsListStatus: 'fail',
      };
    }
    case GET_SINGLE_GRAPH.REQUEST: {
      return {
        ...state,
        singleGraph: {},
      };
    }
    case GET_SINGLE_EMBED_GRAPH.SUCCESS:
    case GET_SINGLE_GRAPH.SUCCESS: {
      const { graph: singleGraph, embedLabels } = action.payload.data;
      const {
        nodes, links, labels, lastUid,
      } = singleGraph;
      Chart.render({
        nodes, links: ChartUtils.cleanLinks(links, nodes), labels, embedLabels, lastUid,
      });
      return {
        ...state,
        singleGraph,
        embedLabels,
      };
    }
    case GET_SINGLE_GRAPH_PREVIEW.SUCCESS: {
      const { graph: singleGraph } = action.payload.data;
      const { nodes, links, labels } = singleGraph;
      Chart.render({
        nodes, links: ChartUtils.cleanLinks(links, nodes), labels,
      });

      return {
        ...state,
        singleGraph,
      };
    }
    case CLEAR_SINGLE_GRAPH: {
      return {
        ...state,
        singleGraph: {},
        embedLabels: [],
      };
    }
    case SET_GRAPH_CUSTOM_FIELDS: {
      const { customFields } = action.payload;
      const singleGraph = { ...state.singleGraph, customFields };
      return {
        ...state,
        singleGraph,
      };
    }
    case SET_NODE_CUSTOM_FIELD: {
      const singleGraph = { ...state.singleGraph };
      const {
        type, name, customField, tabData,
      } = action.payload;
      const res = CustomFields.setValue(singleGraph.customFields, type, name, customField);
      singleGraph.customFields = res.customFields;
      if (!res.success) {
        toast.warn('Some tabs are not imported');
      }
      if (tabData) {
        _.set(singleGraph.customFields, [type, tabData.name, 'subtitle'], tabData.subtitle);
      }
      return {
        ...state,
        singleGraph,
      };
    }
    case ADD_NODE_CUSTOM_FIELD_KEY: {
      const singleGraph = { ...state.singleGraph };
      const { type, key, subtitle } = action.payload;
      singleGraph.customFields = CustomFields.setKey(singleGraph.customFields, type, key, subtitle);
      return {
        ...state,
        singleGraph,
      };
    }
    case RENAME_NODE_CUSTOM_FIELD_KEY: {
      const singleGraph = { ...state.singleGraph };
      const { type, name, oldName } = action.payload;
      singleGraph.customFields = CustomFields.customFieldRename(singleGraph.customFields, type, oldName, name);
      return {
        ...state,
        singleGraph: { ...singleGraph },
      };
    }
    case REMOVE_NODE_CUSTOM_FIELD_KEY: {
      const singleGraph = { ...state.singleGraph };
      const { type, key } = action.payload;
      singleGraph.customFields = CustomFields.removeKey(singleGraph.customFields, type, key);
      return {
        ...state,
        singleGraph,
      };
    }
    case REMOVE_NODE_FROM_CUSTOM_FIELD: {
      const singleGraph = { ...state.singleGraph };
      const { nodeId } = action.payload;
      singleGraph.customFields = CustomFields.removeNode(singleGraph.customFields, nodeId);
      return {
        ...state,
        singleGraph,
      };
    }
    case UPDATE_SINGLE_GRAPH: {
      const { marge, graph } = action.payload;
      const singleGraph = marge ? { ...state.singleGraph, ...graph } : graph;
      return {
        ...state,
        singleGraph: _.cloneDeep(singleGraph),
      };
    }
    case ACTIONS_COUNT.SUCCESS: {
      return {
        ...state,
        actionsCount: {
          ...state.actionsCount,
          ...action.payload.data.result,
        },
      };
    }
    default: {
      return state;
    }
  }
}
