import {
  MY_FRIENDS, ADD_FRIEND, ACCEPT_FRIEND, REMOVE_FRIEND,
} from '../actions/userFriends';

const initialState = {
  myFriends: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case MY_FRIENDS.REQUEST:
    case ADD_FRIEND.REQUEST:
    case ACCEPT_FRIEND.REQUEST:
    case REMOVE_FRIEND.REQUEST:
    {
      return {
        ...state,
        myFriends: [],
      };
    }
    case MY_FRIENDS.SUCCESS:
    case ADD_FRIEND.SUCCESS:
    case ACCEPT_FRIEND.SUCCESS:
    case REMOVE_FRIEND.SUCCESS:
    {
      return {
        ...state, myFriends: action.payload.data.data,
      };
    }
    default: {
      return state;
    }
  }
}
