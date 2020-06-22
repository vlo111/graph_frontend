import { CONVERT_GRAPH } from '../actions/graph';

const initialState = {
  importData: {},
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CONVERT_GRAPH.REQUEST: {
      return {
        ...state,
        importData: {},
      }
    }
    case CONVERT_GRAPH.SUCCESS: {
      const { data: importData } = action.payload;
      return {
        ...state,
        importData,
      }
    }
    default: {
      return state;
    }
  }
}
