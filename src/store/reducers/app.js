import {
  NEW_NODE_MODAL,
  SET_ACTIVE_BUTTON, SET_GRID_INDEXES,
  SHOW_NODE_DESCRIPTION,
  TOGGLE_GRID,
} from '../actions/app';

const initialState = {
  activeButton: 'create',
  nodeDescription: '',
  addNodeParams: {},
  selectedGrid: {
    nodes: [],
    links: [],
  },
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_ACTIVE_BUTTON: {
      return {
        ...state,
        activeButton: action.payload.button,
      };
    }
    case SHOW_NODE_DESCRIPTION: {
      return {
        ...state,
        nodeDescription: action.payload.node,
      };
    }
    case NEW_NODE_MODAL: {
      return {
        ...state,
        addNodeParams: action.payload.params,
      };
    }
    case TOGGLE_GRID: {
      const { index, grid } = action.payload;
      const { selectedGrid } = state;
      selectedGrid[grid] = [...selectedGrid[grid]];
      const i = selectedGrid[grid].indexOf(index);
      if (i > -1) {
        selectedGrid[grid].splice(i, 1);
      } else {
        selectedGrid[grid].push(index);
      }
      return {
        ...state,
        selectedGrid,
      };
    }
    case SET_GRID_INDEXES: {
      const { indexes, grid } = action.payload;
      const selectedGrid = { ...state.selectedGrid };
      selectedGrid[grid] = indexes;
      return {
        ...state,
        selectedGrid,
      };
    }
    default: {
      return state;
    }
  }
}
