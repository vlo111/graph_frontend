import { CONVERT_GRAPH, CREATE_GRAPH, GET_GRAPHS_LIST, GET_SINGLE_GRAPH, UPDATE_GRAPH } from '../actions/graphs';

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
