import {
  CREATE_SHARE_GRAPH,
  DELETE_SHARE_GRAPH,
  LIST_SHARE_GRAPH,
  USER_SHARE_GRAPH,
} from '../actions/shareGraphs';

const initialState = {
  shareGraphsList: [],
  userGraphs: [],
  page: 0,
  total: 0,
  totalPages: 0,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LIST_SHARE_GRAPH.REQUEST:
    {
      return {
        ...state,
        shareGraphsList: [],
      };
    }
    case LIST_SHARE_GRAPH.SUCCESS:
    case CREATE_SHARE_GRAPH.SUCCESS:
    case DELETE_SHARE_GRAPH.SUCCESS:
    {
      const {
        shareGraphs: shareGraphsList, page, total, totalPages,
      } = action.payload.data;
      return {
        shareGraphsList, page, total, totalPages,
      };
    }
    case USER_SHARE_GRAPH.SUCCESS:
    {
      const {
        userGraphs,
      } = action.payload.data;
      return {
        userGraphs,
      };
    }
    default: {
      return state;
    }
  }
}
