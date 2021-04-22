import _ from 'lodash';
import { toast } from 'react-toastify';
import { 
  NODE_HISTORY, GRAPH_HISTORY, RESET_GRAPH_HISTORY
} from '../actions/graphsHistory'; 

const initialState = { 
  singleNodeHistory: [], 
  singleGraphHistory: [], 
  nodePositionCount: '',
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case NODE_HISTORY.REQUEST:
    case NODE_HISTORY.FAIL: {
      return {
        ...state,
        singleNodeHistory: [],
        nodePositionCount: '',
      };
    }
    case NODE_HISTORY.SUCCESS: {
      const { singleNodeHistory } = action.payload.data;
     // state.graphsHistory.singleNodeHistory = singleNodeHistory;
      console.log(singleNodeHistory, 'action.payload.data');
      return {
        ...state, 
        singleNodeHistory: singleNodeHistory.data,
        nodePositionCount: singleNodeHistory?.countPositions,
        nodeTabsViewCount: singleNodeHistory?.countTabsView,
      };
    }
    case GRAPH_HISTORY.REQUEST: {
      return {
        ...state, 
        singleGraphHistory: [], 
      };
    }
    case GRAPH_HISTORY.SUCCESS: {
      const { data } = action.payload.data;
     // state.graphsHistory.singleNodeHistory = singleNodeHistory;
      console.log(data, 'action.payload.data');
      return {
        ...state, 
        singleGraphHistory: data, 
      };
    }
    case RESET_GRAPH_HISTORY: { 
      return {
        ...state,
        //singleGraphHistory: [],
      };
    }
    default: {
      return state;
    }
  }
}
