import { GET_SHARED_WITH_USERS } from "../actions/share";

const initialState = {
  shareWithUsers: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_SHARED_WITH_USERS.REQUEST: {
      return {
        shareWithUsers: [],
        ...state,
      }
    }
    case GET_SHARED_WITH_USERS.SUCCESS: {
      const { users: shareWithUsers } = action.payload.data;
      console.log(shareWithUsers, 4444)
      return {
        ...state,
        shareWithUsers,
      }
    }
    default: {
      return state;
    }
  }
}
