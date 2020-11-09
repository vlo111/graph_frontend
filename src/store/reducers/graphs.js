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
  ACTIONS_COUNT, GET_SINGLE_EMBED_GRAPH, SET_GRAPH_CUSTOM_FIELDS,
} from '../actions/graphs';
import CustomFields from '../../helpers/CustomFields';
import Chart from "../../Chart";
import ChartUtils from "../../helpers/ChartUtils";

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
      const { nodes, links, labels } = singleGraph;
      Chart.render({
        nodes, links: ChartUtils.cleanLinks(links, nodes), labels, embedLabels,
      });
      return {
        ...state,
        singleGraph,
        embedLabels,
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
    case REMOVE_NODE_CUSTOM_FIELD_KEY: {
      const singleGraph = { ...state.singleGraph };
      const { type, key } = action.payload;
      singleGraph.customFields = CustomFields.removeKey(singleGraph.customFields, type, key);
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
