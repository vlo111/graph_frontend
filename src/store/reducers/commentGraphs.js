import {
  CREATE_COMMENT_GRAPH,
  GET_GRAPH_COMMENTS,
} from '../actions/commentGraphs';

const initialState = {
  graphComments: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_COMMENT_GRAPH.SUCCESS:
    {
      const {
        graphComments,
      } = action.payload.data;

      return {
        ...state,
        graphComments: [...state.graphComments, graphComments],
      };
    }
    case GET_GRAPH_COMMENTS.SUCCESS:
    {
      const {
        graphComments,
      } = action.payload.data;

      return {
        ...state, graphComments,
      };
    }
    default: {
      return state;
    }
  }
}
