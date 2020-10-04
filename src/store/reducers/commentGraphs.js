import {
  CREATE_COMMENT_GRAPH,
  GET_GRAPH_COMMENTS,
} from '../actions/commentGraphs';

const initialState = [];

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_COMMENT_GRAPH.SUCCESS:
    case GET_GRAPH_COMMENTS.SUCCESS:
    {
      const {
        graphComments,
      } = action.payload.data;
      console.log(action.payload, action.payload);
      return {
        ...state, graphComments,
      };
    }
    default: {
      return state;
    }
  }
}
