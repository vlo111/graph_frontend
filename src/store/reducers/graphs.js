import {
  CLEAR_SINGLE_GRAPH,
  CONVERT_GRAPH,
  GET_GRAPHS_LIST,
  GET_SINGLE_GRAPH,
  SET_NODE_CUSTOM_FIELD, ADD_NODE_CUSTOM_FIELD_KEY
} from '../actions/graphs';
import _ from 'lodash';
import CustomFields from "../../helpers/CustomFields";

const initialState = {
  importData: {},
  graphsList: [],
  singleGraph: {},
  graphsListInfo: {
    totalPages: 0,
  },
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
    case SET_NODE_CUSTOM_FIELD: {
      const singleGraph = { ...state.singleGraph };
      const { type, name, customField } = action.payload;
      singleGraph.customFields = CustomFields.setValue(singleGraph.customFields, type, name, customField);
      return {
        ...state,
        singleGraph,
      };
    }
    case ADD_NODE_CUSTOM_FIELD_KEY: {
      const singleGraph = { ...state.singleGraph };
      const { type, key } = action.payload;
      singleGraph.customFields = CustomFields.setKey(singleGraph.customFields, type, key);
      return {
        ...state,
        singleGraph,
      };
    }
    default: {
      return state;
    }
  }
}
