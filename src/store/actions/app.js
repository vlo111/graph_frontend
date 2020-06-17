export const SET_ACTIVE_BUTTON = 'SET_ACTIVE_BUTTON';

export function setActiveButton(button) {
  return {
    type: SET_ACTIVE_BUTTON,
    payload: {
      button,
    },
  };
}

export const SHOW_NODE_INFO = 'SHOW_NODE_INFO';

export function showNodeInfo(nodeName) {
  return {
    type: SHOW_NODE_INFO,
    payload: {
      nodeName,
    },
  };
}


export const NEW_NODE_MODAL = 'NEW_NODE_MODAL';

export function toggleNodeModal(params = {}) {
  return {
    type: NEW_NODE_MODAL,
    payload: {
      params,
    },
  };
}

export const TOGGLE_GRID = 'TOGGLE_GRID';

export function toggledGrid(grid, index) {
  return {
    type: TOGGLE_GRID,
    payload: {
      grid,
      index,
    },
  };
}

export const SET_GRID_INDEXES = 'SET_GRID_INDEXES';

export function setGridIndexes(grid, indexes = []) {
  return {
    type: SET_GRID_INDEXES,
    payload: { grid, indexes },
  };
}

