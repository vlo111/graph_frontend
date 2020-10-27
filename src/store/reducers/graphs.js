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

const initialState = {
  importData: {},
  graphsList: [],
  singleGraph: {},
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
        graphsList: [],
      };
    }
    case GET_GRAPHS_LIST.SUCCESS: {
      const { graphs: graphsList, ...graphsListInfo } = action.payload.data;
      return {
        ...state,
        graphsList,
        graphsListInfo,
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
      const { graph: singleGraph } = action.payload.data;
      singleGraph.customFields = { ...singleGraph.customFields };
      return {
        ...state,
        singleGraph,
      };
    }
    case CLEAR_SINGLE_GRAPH: {
      return {
        ...state,
        singleGraph: {},
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
      return {
        ...state,
        singleGraph: action.payload.graph,
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
