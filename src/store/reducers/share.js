import { GET_SHARE_GRAPH_LIST, GET_SHARED_WITH_USERS } from '../actions/share';

const initialState = {
  shareWithUsers: [],
  shareGraphsListStatus: '',
  shareGraphsList: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_SHARED_WITH_USERS.REQUEST: {
      return {
        shareWithUsers: [],
        ...state,
      };
    }
    case GET_SHARED_WITH_USERS.SUCCESS: {
      const { users: shareWithUsers } = action.payload.data;
      console.log(shareWithUsers, 4444);
      return {
        ...state,
        shareWithUsers,
      };
    }
    case GET_SHARE_GRAPH_LIST.REQUEST: {
      return {
        ...state,
        shareGraphsListStatus: 'request',
        shareGraphsList: [],
      };
    }
    case GET_SHARE_GRAPH_LIST.SUCCESS: {
      const { shareGraphs: shareGraphsList } = action.payload.data;
      return {
        ...state,
        shareGraphsListStatus: 'success',
        shareGraphsList,
      };
    }
    case GET_SHARE_GRAPH_LIST.FAIL: {
      return {
        ...state,
        shareGraphsListStatus: 'fail',
        shareGraphsList: [],
      };
    }
    default: {
      return state;
    }
  }
}
