import {
  GET_FRIENDS,
} from '../actions/userFriends';

const initialState = {
  friendsList: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_FRIENDS.SUCCESS:
    {
      const {
        friendsList,
      } = action.payload.data;
      return {
        ...state,
        friendsList,
      };
    }
    default: {
      return state;
    }
  }
}
